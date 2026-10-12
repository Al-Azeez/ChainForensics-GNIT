import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation } from '../types';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  Clock,
  AlertOctagon,
  RefreshCw,
  Plus
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInvestigations({
        search: searchTerm || undefined,
        classification: selectedClassification !== 'all' ? selectedClassification : undefined
      });
      setInvestigations(res.investigations || []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedClassification]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this forensic investigation record?')) return;
    setDeletingId(id);
    try {
      await api.deleteInvestigation(id);
      setInvestigations(prev => prev.filter(inv => (inv._id || inv.id) !== id));
    } catch {
      // Delete error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
            <History className="w-4 h-4" />
            <span>CASE MANAGEMENT ARCHIVE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Forensic Investigation History
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Browse, search, and manage archived transaction dossiers and risk findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-[#0B1730] border border-white/10 text-[#94A3B8] hover:text-[#06D9FF] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#06D9FF]' : ''}`} />
          </button>
          <Link
            to="/app/investigate"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-glow-blue transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search address, hash, title, tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#06D9FF]"
          />
        </form>

        {/* Classification Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
          <select
            value={selectedClassification}
            onChange={e => setSelectedClassification(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
          >
            <option value="all">All Classifications</option>
            <option value="Requires Further Review">Requires Further Review</option>
            <option value="Unusual Activity">Unusual Activity</option>
            <option value="No Major Anomaly Detected">No Major Anomaly Detected</option>
            <option value="Insufficient Data">Insufficient Data</option>
          </select>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0B1730]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#06132D] text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Case Title & Identifier</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4">Volume</th>
              <th className="py-3.5 px-4">Transactions</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Data Source</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {investigations.length > 0 ? (
              investigations.map(inv => (
                <tr
                  key={inv._id || inv.id}
                  onClick={() => navigate(`/app/results/${inv._id || inv.id}`)}
                  className="hover:bg-[#102246]/40 transition-colors cursor-pointer group"
                >
                  {/* Title & Id */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#F8FAFC] truncate">
                      {inv.title}
                    </div>
                    <div className="text-[10px] text-[#06D9FF] truncate">
                      {inv.inputIdentifier}
                    </div>
                  </td>

                  {/* Classification */}
                  <td className="py-3.5 px-4">
                    <RiskScoreBadge
                      score={inv.riskAssessment?.risk_score}
                      classification={inv.riskAssessment?.risk_classification}
                      size="sm"
                    />
                  </td>

                  {/* Volume */}
                  <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">
                    {((inv.transactionSummary?.inflowEth || 0) + (inv.transactionSummary?.outflowEth || 0)).toFixed(2)}{' '}
                    <span className="text-[11px] text-[#06D9FF] font-mono">
                      {(inv.network || '').toLowerCase() === 'bitcoin' ? 'BTC' : (inv.network || '').toLowerCase() === 'bsc' ? 'BNB' : (inv.network || '').toLowerCase() === 'polygon' ? 'POL' : 'ETH'}
                    </span>
                  </td>

                  {/* Tx count */}
                  <td className="py-3.5 px-4 text-[#94A3B8]">
                    {inv.transactionSummary?.totalTx || 0}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-[#94A3B8] text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[#F8FAFC]">
                      <Calendar className="w-3 h-3 text-[#94A3B8]" />
                      <span>
                        {new Date(inv.analysisTimestamp).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#06D9FF] font-mono mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-[#06D9FF]/70" />
                      <span>
                        {new Date(inv.analysisTimestamp).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Data Source Badge */}
                  <td className="py-3.5 px-4">
                    {inv.isSampleData ? (
                      <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold border border-[#F59E0B]/30">
                        SAMPLE DATA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#2563EB]/20 text-[#06D9FF] text-[10px]">
                        LIVE RPC
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/app/results/${inv._id || inv.id}`}
                        className="p-1.5 rounded-lg bg-[#2563EB]/20 text-[#06D9FF] hover:bg-[#2563EB] hover:text-white transition-colors"
                        title="Inspect Case"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={e => handleDelete(inv._id || inv.id!, e)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#06132D] transition-colors"
                        title="Delete Case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                  No previous investigations found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
