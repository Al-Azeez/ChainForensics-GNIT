import React, { useState, useMemo } from 'react';
import { NormalizedTransaction } from '../types';
import { ExternalLink, Copy, Check, Filter, Search, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

interface TransactionTableProps {
  transactions: NormalizedTransaction[];
  targetAddress?: string;
  network?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  targetAddress,
  network = 'ethereum'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'in' | 'out'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const pageSize = 10;

  const targetLower = targetAddress?.toLowerCase();

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        tx.hash.toLowerCase().includes(s) ||
        (tx.from_address && tx.from_address.toLowerCase().includes(s)) ||
        (tx.to_address && tx.to_address.toLowerCase().includes(s)) ||
        (tx.method && tx.method.toLowerCase().includes(s));

      if (!matchesSearch) return false;

      // Status
      if (filterStatus === 'success' && tx.is_error) return false;
      if (filterStatus === 'failed' && !tx.is_error) return false;

      // Direction
      if (filterDirection === 'in' && targetLower) {
        if ((tx.to_address || '').toLowerCase() !== targetLower) return false;
      }
      if (filterDirection === 'out' && targetLower) {
        if ((tx.from_address || '').toLowerCase() !== targetLower) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, filterDirection, filterStatus, targetLower]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentRecords = filtered.slice((page - 1) * pageSize, page * pageSize);

  const copyToClipboard = (text: string, hashKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hashKey);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const currency = (network || '').toLowerCase().trim() === 'bitcoin'
    ? 'BTC'
    : (network || '').toLowerCase().trim() === 'bsc'
      ? 'BNB'
      : (network || '').toLowerCase().trim() === 'polygon'
        ? 'POL'
        : 'ETH';

  const getExplorerTxUrl = (hash: string) => {
    const net = (network || '').toLowerCase().trim();
    if (net === 'bitcoin') {
      const clean = hash.startsWith('0x') ? hash.slice(2) : hash;
      return `https://mempool.space/tx/${clean}`;
    }
    if (net === 'polygon') return `https://polygonscan.com/tx/${hash}`;
    if (net === 'bsc') return `https://bscscan.com/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search hash, address, method..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#06D9FF]/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-[#06132D] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => { setFilterDirection('all'); setPage(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterDirection === 'all' ? 'bg-[#2563EB] text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              All Flows
            </button>
            <button
              onClick={() => { setFilterDirection('in'); setPage(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterDirection === 'in' ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Inflow
            </button>
            <button
              onClick={() => { setFilterDirection('out'); setPage(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterDirection === 'out' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Outflow
            </button>
          </div>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as any); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-[#06132D] border border-white/10 text-xs text-[#94A3B8] focus:outline-none focus:border-[#06D9FF]/50"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="failed">Reverted Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0B1730]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#06132D] text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Tx Hash</th>
              <th className="py-3 px-4">Method / Action</th>
              <th className="py-3 px-4">From</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-4">To</th>
              <th className="py-3 px-4 text-right">Value ({currency})</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentRecords.length > 0 ? (
              currentRecords.map((tx, idx) => {
                const isOut = targetLower && (tx.from_address || '').toLowerCase() === targetLower;
                const isIn = targetLower && (tx.to_address || '').toLowerCase() === targetLower;

                return (
                  <tr key={tx.hash + '_' + idx} className="hover:bg-[#102246]/40 transition-colors">
                    {/* Hash */}
                    <td className="py-3 px-4 text-[#06D9FF]">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                        <button
                          onClick={() => copyToClipboard(tx.hash, tx.hash)}
                          className="text-[#94A3B8] hover:text-[#06D9FF] transition-colors"
                          title="Copy Full Hash"
                        >
                          {copiedHash === tx.hash ? (
                            <Check className="w-3 h-3 text-[#22C55E]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4 text-[#F8FAFC]">
                      <span className="px-2 py-0.5 rounded bg-[#06132D] border border-white/5 text-[10px]">
                        {tx.method || 'Transfer'}
                      </span>
                    </td>

                    {/* From */}
                    <td className="py-3 px-4 text-[#94A3B8]">
                      <span className={isOut ? 'text-[#06D9FF] font-bold' : ''}>
                        {tx.from_address ? `${tx.from_address.slice(0, 6)}...${tx.from_address.slice(-4)}` : 'N/A'}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] text-[10px] font-semibold border border-[#EF4444]/30">
                          <ArrowUpRight className="w-3 h-3" /> OUT
                        </span>
                      ) : isIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-semibold border border-[#22C55E]/30">
                          <ArrowDownLeft className="w-3 h-3" /> IN
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[10px]">—</span>
                      )}
                    </td>

                    {/* To */}
                    <td className="py-3 px-4 text-[#94A3B8]">
                      <span className={isIn ? 'text-[#06D9FF] font-bold' : ''}>
                        {tx.to_address ? `${tx.to_address.slice(0, 6)}...${tx.to_address.slice(-4)}` : 'Contract Creation'}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 text-right font-bold text-[#F8FAFC]">
                      {tx.value_eth > 0 ? `${tx.value_eth.toFixed(4)} ${currency}` : `0 ${currency}`}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-[#94A3B8] text-[11px]">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {tx.is_error ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" /> Reverted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-semibold">
                          Success
                        </span>
                      )}
                    </td>

                    {/* Explorer */}
                    <td className="py-3 px-4 text-center">
                      <a
                        href={getExplorerTxUrl(tx.hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center p-1 rounded text-[#94A3B8] hover:text-[#06D9FF] hover:bg-[#06132D] transition-colors"
                        title="View on Etherscan Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#94A3B8] text-xs">
                  No transaction records matched the selected query or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(filtered.length, page * pageSize)} of {filtered.length} transactions
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-[#06132D] border border-white/10 disabled:opacity-40 hover:border-[#06D9FF]/40 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-[#F8FAFC]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-[#06132D] border border-white/10 disabled:opacity-40 hover:border-[#06D9FF]/40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
