import { JsonRpcProvider, formatEther, isAddress, isHexString } from 'ethers';
import { config } from '../config/index.js';

export interface NormalizedTransaction {
  hash: string;
  from_address: string;
  to_address: string | null;
  value_eth: number;
  timestamp: number;
  block_number?: number;
  gas_price_gwei?: number;
  gas_used?: number;
  is_error: boolean;
  method?: string;
  token_symbol?: string;
  token_value?: number;
}

export interface WalletOverview {
  address: string;
  balanceEth: string;
  isContract: boolean;
  transactionCount: number;
  network: string;
}

export const NETWORK_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  optimism: 10
};

export const NETWORK_RPC_MAP: Record<string, string[]> = {
  ethereum: [
    'https://ethereum.publicnode.com',
    'https://eth.drpc.org',
    'https://eth.meowrpc.com',
    'https://1rpc.io/eth',
    'https://cloudflare-eth.com'
  ],
  polygon: [
    'https://polygon.gateway.tenderly.co',
    'https://gateway.tenderly.co/public/polygon',
    'https://1rpc.io/matic',
    'https://polygon.api.onfinality.io/public',
    'https://polygon-bor.publicnode.com',
    'https://polygon.drpc.org'
  ],
  bsc: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://1rpc.io/bnb',
    'https://bsc.meowrpc.com',
    'https://bsc.drpc.org'
  ],
  arbitrum: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.drpc.org',
    'https://arbitrum.meowrpc.com',
    'https://1rpc.io/arb'
  ],
  base: [
    'https://mainnet.base.org',
    'https://base.drpc.org',
    'https://base.meowrpc.com',
    'https://1rpc.io/base'
  ],
  optimism: [
    'https://mainnet.optimism.io',
    'https://optimism.drpc.org',
    'https://1rpc.io/op'
  ]
};

const PUBLIC_FALLBACK_RPCS = NETWORK_RPC_MAP.ethereum;

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg = 'Timeout'): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export class BlockchainService {
  private activeProviders: Map<string, { provider: JsonRpcProvider; rpcUrl: string }> = new Map();
  public currentRpcUrl: string;

  constructor() {
    this.currentRpcUrl = config.ethereumRpcUrl || PUBLIC_FALLBACK_RPCS[0];
  }

  private async getWorkingProvider(network = 'ethereum'): Promise<JsonRpcProvider> {
    const netKey = (network || 'ethereum').toLowerCase().trim();
    const chainId = NETWORK_CHAIN_IDS[netKey] || 1;

    // Check if we have an active working provider for this network
    const cached = this.activeProviders.get(netKey);
    if (cached) {
      try {
        await withTimeout(cached.provider.getBlockNumber(), 3500, 'RPC check timeout');
        this.currentRpcUrl = cached.rpcUrl;
        return cached.provider;
      } catch {
        // Cached provider failed, purge and test alternatives
        this.activeProviders.delete(netKey);
      }
    }

    // Determine RPC list with optional environment variable overrides
    const envKey = `${netKey.toUpperCase()}_RPC_URL`;
    const envUrl = (process.env[envKey] as string) || (netKey === 'ethereum' ? config.ethereumRpcUrl : undefined);
    const defaultList = NETWORK_RPC_MAP[netKey] || PUBLIC_FALLBACK_RPCS;
    const rpcList = envUrl ? [envUrl, ...defaultList.filter(u => u !== envUrl)] : defaultList;

    let lastError: any = null;
    for (const fallbackUrl of rpcList) {
      try {
        const testProvider = new JsonRpcProvider(fallbackUrl, chainId, { staticNetwork: true });
        await withTimeout(testProvider.getBlockNumber(), 3500, 'RPC check timeout');
        this.currentRpcUrl = fallbackUrl;
        this.activeProviders.set(netKey, { provider: testProvider, rpcUrl: fallbackUrl });
        return testProvider;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    throw new Error(`Unable to connect to any JSON-RPC provider for ${network}: ${lastError?.message || 'Connection timed out'}`);
  }

  public validateIdentifier(identifier: string, network = 'ethereum'): { isValid: boolean; type?: 'address' | 'transaction'; error?: string } {
    const trimmed = identifier.trim();
    const isBtc = (network || '').toLowerCase().trim() === 'bitcoin';

    if (isBtc) {
      if (/^(0x)?[a-fA-F0-9]{64}$/.test(trimmed)) {
        return { isValid: true, type: 'transaction' };
      }
      if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed) || /^(bc1)[a-zA-HJ-NP-Z0-9]{25,90}$/i.test(trimmed)) {
        return { isValid: true, type: 'address' };
      }
      return {
        isValid: false,
        error: 'Invalid Bitcoin identifier. Must be a valid Bitcoin address (Legacy 1..., Script 3..., SegWit/Taproot bc1...) or 64-character transaction hash.'
      };
    }

    if (isAddress(trimmed)) {
      return { isValid: true, type: 'address' };
    }
    if (isHexString(trimmed, 32)) {
      return { isValid: true, type: 'transaction' };
    }
    return {
      isValid: false,
      error: 'Invalid identifier format. Must be a 42-character address (0x...) or a 66-character transaction hash (0x...).'
    };
  }

  public async getWalletOverview(address: string, network = 'ethereum'): Promise<WalletOverview> {
    const netKey = (network || 'ethereum').toLowerCase().trim();
    const provider = await this.getWorkingProvider(network);
    try {
      const [balanceWei, code, txCount] = await Promise.all([
        withTimeout(provider.getBalance(address), 6000, 'getBalance timeout'),
        withTimeout(provider.getCode(address), 6000, 'getCode timeout'),
        withTimeout(provider.getTransactionCount(address), 6000, 'getTransactionCount timeout')
      ]);

      return {
        address,
        balanceEth: formatEther(balanceWei),
        isContract: code !== '0x' && code.length > 2,
        transactionCount: txCount,
        network: `${network.toUpperCase()} Network`
      };
    } catch (err) {
      this.activeProviders.delete(netKey);
      throw err;
    }
  }

  public async getTransactionDetails(txHash: string, network = 'ethereum'): Promise<NormalizedTransaction> {
    const netKey = (network || 'ethereum').toLowerCase().trim();
    const provider = await this.getWorkingProvider(network);
    try {
      const tx = await withTimeout(provider.getTransaction(txHash), 7000, 'getTransaction timeout');

      if (!tx) {
        throw new Error(`Transaction ${txHash} was not found on ${network.toUpperCase()}.`);
      }

      const receipt = await withTimeout(provider.getTransactionReceipt(txHash), 7000, 'getReceipt timeout').catch(() => null);
      const block = tx.blockNumber ? await withTimeout(provider.getBlock(tx.blockNumber), 7000, 'getBlock timeout').catch(() => null) : null;
      const timestamp = block ? block.timestamp : Math.floor(Date.now() / 1000);

    const valueEth = parseFloat(formatEther(tx.value));
    const gasPriceGwei = tx.gasPrice ? parseFloat(formatEther(tx.gasPrice)) * 1e9 : 0;
    const gasUsed = receipt ? Number(receipt.gasUsed) : undefined;
    const isError = receipt ? receipt.status === 0 : false;

    // Detect method signature
    let method = 'Transfer / Native ETH';
    if (tx.data && tx.data.length >= 10 && tx.data !== '0x') {
      const selector = tx.data.slice(0, 10).toLowerCase();
      if (selector === '0xa9059cbb') {
        method = 'ERC-20 transfer(address,uint256)';
      } else if (selector === '0x23b872dd') {
        method = 'ERC-20 transferFrom(address,address,uint256)';
      } else if (selector === '0x095ea7b3') {
        method = 'ERC-20 approve(address,uint256)';
      } else {
        method = `Contract Call (${selector})`;
      }
    }

      return {
        hash: tx.hash,
        from_address: tx.from,
        to_address: tx.to,
        value_eth: valueEth,
        timestamp,
        block_number: tx.blockNumber ?? undefined,
        gas_price_gwei: gasPriceGwei,
        gas_used: gasUsed,
        is_error: isError,
        method
      };
    } catch (err) {
      this.activeProviders.delete(netKey);
      throw err;
    }
  }

  public async checkHealth(): Promise<{ status: string; rpcUrl: string; blockNumber?: number; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const provider = await this.getWorkingProvider();
      const blockNum = await withTimeout(provider.getBlockNumber(), 3000, 'RPC Timeout');
      return {
        status: 'healthy',
        rpcUrl: this.currentRpcUrl,
        blockNumber: blockNum,
        latencyMs: Date.now() - start
      };
    } catch (e: any) {
      return {
        status: 'unreachable',
        rpcUrl: this.currentRpcUrl,
        latencyMs: Date.now() - start,
        error: e.message || 'RPC connection failed'
      };
    }
  }
}

export const blockchainService = new BlockchainService();
