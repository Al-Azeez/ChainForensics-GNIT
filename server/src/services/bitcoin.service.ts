import axios from 'axios';
import { NormalizedTransaction, WalletOverview } from './blockchain.service.js';

const BITCOIN_API_ENDPOINTS = [
  'https://mempool.space/api',
  'https://blockstream.info/api'
];

export class BitcoinService {
  private async fetchWithFallback<T>(path: string): Promise<T> {
    let lastError: any = null;
    for (const baseUrl of BITCOIN_API_ENDPOINTS) {
      try {
        const response = await axios.get<T>(`${baseUrl}${path}`, {
          timeout: 6000,
          headers: {
            'User-Agent': 'ChainForensics/1.0.0 (Forensics Investigator)'
          }
        });
        return response.data;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }
    throw new Error(`Unable to fetch Bitcoin telemetry from public endpoints: ${lastError?.message || 'Network timeout'}`);
  }

  public validateIdentifier(identifier: string): { isValid: boolean; type?: 'address' | 'transaction'; error?: string } {
    const clean = identifier.trim();
    // 64 hex characters (or 66 with 0x) is a Bitcoin transaction hash
    if (/^(0x)?[a-fA-F0-9]{64}$/.test(clean)) {
      return { isValid: true, type: 'transaction' };
    }
    // Bitcoin addresses:
    // Legacy P2PKH (starts with 1) & P2SH (starts with 3): Base58, 25-34 chars
    // Native SegWit P2WPKH/P2WSH (starts with bc1q) & Taproot (starts with bc1p): 26-90 chars
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(clean) || /^(bc1)[a-zA-HJ-NP-Z0-9]{25,90}$/i.test(clean)) {
      return { isValid: true, type: 'address' };
    }
    return {
      isValid: false,
      error: 'Invalid Bitcoin identifier. Must be a valid Bitcoin address (Legacy 1..., Script 3..., SegWit/Taproot bc1...) or 64-char transaction hash.'
    };
  }

  public async getWalletOverview(address: string): Promise<WalletOverview> {
    const data = await this.fetchWithFallback<any>(`/address/${address}`);
    const funded = data.chain_stats?.funded_txo_sum || 0;
    const spent = data.chain_stats?.spent_txo_sum || 0;
    const balanceBtc = ((funded - spent) / 1e8).toFixed(8);
    const txCount = (data.chain_stats?.tx_count || 0) + (data.mempool_stats?.tx_count || 0);

    return {
      address,
      balanceEth: balanceBtc, // standardized value field
      isContract: false,
      transactionCount: txCount,
      network: 'BITCOIN Network'
    };
  }

  public async getRecentTransactions(address: string, maxRecords = 20): Promise<NormalizedTransaction[]> {
    const rawTxs = await this.fetchWithFallback<any[]>(`/address/${address}/txs`);
    const cleanAddr = address.toLowerCase();

    return rawTxs.slice(0, maxRecords).map((tx) => {
      // Identify sender
      const primaryInput = tx.vin?.[0];
      const fromAddr = primaryInput?.is_coinbase
        ? 'Coinbase Mint (Block Reward)'
        : (primaryInput?.prevout?.scriptpubkey_address || 'Multiple UTXO Inputs');

      // Identify receiver and value relative to target address
      const matchedOutput = tx.vout?.find((v: any) => v.scriptpubkey_address?.toLowerCase() === cleanAddr);
      const isIncoming = Boolean(matchedOutput);
      const toAddr = matchedOutput
        ? matchedOutput.scriptpubkey_address
        : (tx.vout?.[0]?.scriptpubkey_address || address);

      const valueSats = matchedOutput
        ? matchedOutput.value
        : (tx.vout?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0);

      const valueBtc = parseFloat((valueSats / 1e8).toFixed(8));
      const feeBtc = tx.fee ? parseFloat((tx.fee / 1e8).toFixed(8)) : 0;
      const timestamp = tx.status?.block_time || Math.floor(Date.now() / 1000);

      let method = 'Bitcoin UTXO Transfer';
      if (primaryInput?.is_coinbase) {
        method = 'Coinbase Mined Reward';
      } else if (tx.vin && tx.vin.length > 3) {
        method = `UTXO Consolidation (${tx.vin.length} inputs)`;
      } else if (tx.vout && tx.vout.length > 3) {
        method = `UTXO Fan-out (${tx.vout.length} outputs)`;
      }

      return {
        hash: tx.txid,
        from_address: fromAddr,
        to_address: toAddr,
        value_eth: valueBtc,
        timestamp,
        block_number: tx.status?.block_height,
        gas_price_gwei: feeBtc,
        gas_used: tx.size || tx.weight || 250,
        is_error: false,
        method
      };
    });
  }

  public async getTransactionDetails(txHash: string): Promise<NormalizedTransaction> {
    const cleanHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
    const tx = await this.fetchWithFallback<any>(`/tx/${cleanHash}`);

    const primaryInput = tx.vin?.[0];
    const fromAddr = primaryInput?.is_coinbase
      ? 'Coinbase Mint'
      : (primaryInput?.prevout?.scriptpubkey_address || 'Multiple UTXO Inputs');

    const primaryOutput = tx.vout?.[0];
    const toAddr = primaryOutput?.scriptpubkey_address || 'UTXO Script Destination';

    const totalOutputSats = tx.vout?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0;
    const valueBtc = parseFloat((totalOutputSats / 1e8).toFixed(8));
    const feeBtc = tx.fee ? parseFloat((tx.fee / 1e8).toFixed(8)) : 0;
    const timestamp = tx.status?.block_time || Math.floor(Date.now() / 1000);

    return {
      hash: tx.txid,
      from_address: fromAddr,
      to_address: toAddr,
      value_eth: valueBtc,
      timestamp,
      block_number: tx.status?.block_height,
      gas_price_gwei: feeBtc,
      gas_used: tx.size || 250,
      is_error: false,
      method: primaryInput?.is_coinbase ? 'Coinbase Block Reward' : 'Bitcoin UTXO Transaction'
    };
  }
}

export const bitcoinService = new BitcoinService();
