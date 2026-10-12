import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Investigation, SystemHealth } from '../types';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import {
  Search,
  ShieldAlert,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Cpu,
  Database,
  Share2,
  RefreshCw,
  Plus,
  Play,
  FileText,
  Clock,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickInput, setQuickInput] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, healthRes] = await Promise.all([
        api.getInvestigations({ limit: 10 }),
        api.getHealth()
      ]);
      setInvestigations(invRes.investigations || []);
      setHealth(healthRes);
    } catch {
      // Degraded or offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics from actual stored investigations
  const totalCount = investigations.length;
  const totalTxAnalyzed = investigations.reduce(
    (sum, inv) => sum + (inv.transactionSummary?.totalTx || 0),
    0
  );
  const totalEthVolume = investigations.reduce(
    (sum, inv) =>
      sum + (inv.transactionSummary?.inflowEth || 0) + (inv.transactionSummary?.outflowEth || 0),
    0
  );
  const reviewCount = investigations.filter(
    inv => inv.riskAssessment?.risk_classification === 'Requires Further Review'
  ).length;

  // Build chart timeline from recent investigations
  const chartData = investigations
    .slice()
    .reverse()
    .map((inv, idx) => ({
      name: `Case #${idx + 1}`,
      txCount: inv.transactionSummary?.totalTx || 0,
      volume: inv.transactionSummary?.inflowEth || 0,
      risk: inv.riskAssessment?.risk_score || 0
    }));

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate(`/app/investigate?q=${encodeURIComponent(quickInput.trim())}`);
  };

  const latestWithGraph = investigations.find(
    inv => inv.graphData && inv.graphData.nodes?.length > 0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Investigation Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#06132D] via-[#0B1730] to-[#06132D] border border-[#06D9FF]/20 p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              Forensic Operations Command
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Monitor blockchain transaction flows, evaluate anomaly markers, and launch deep investigations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-[#0B1730] border border-white/10 text-[#94A3B8] hover:text-[#06D9FF] transition-colors"
              title="Refresh Data"
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

        {/* Quick Search Input */}
        <form onSubmit={handleQuickAnalyze} className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#06D9FF]" />
          <input
            type="text"
            placeholder="Quick search Ethereum address (0x...) or transaction hash..."
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#020817] border border-[#06D9FF]/30 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#06D9FF] shadow-glow-cyan"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Inspect
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-mono uppercase">Total Investigations</span>
            <Layers className="w-4 h-4 text-[#06D9FF]" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#F8FAFC] block">
            {totalCount}
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            {totalCount > 0 ? 'Persisted in database & memory' : 'No saved cases yet'}
          </span>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-mono uppercase">Transactions Analyzed</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#F8FAFC] block">
            {totalTxAnalyzed}
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            {totalEthVolume.toFixed(2)} ETH cumulative volume
          </span>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-mono uppercase">Requires Review</span>
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-[#EF4444] block">
            {reviewCount}
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            High-risk or critical rule triggers
          </span>
        </div>

        {/* Card 4: Service Connectivity */}
        <div className="p-4 rounded-xl bg-[#0B1730] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-xs font-mono uppercase">AI Engine Status</span>
            <Cpu className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health?.services.aiEngine.status === 'healthy'
                  ? 'bg-[#22C55E] animate-pulse'
                  : 'bg-[#F59E0B]'
              }`}
            />
            <span className="text-lg font-bold font-mono text-[#F8FAFC]">
              {health?.services.aiEngine.status === 'healthy' ? 'Online' : 'Degraded'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8]">
            FastAPI + Isolation Forest
          </span>
        </div>
      </div>

      {/* Main Grid: Chart & Network Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Investigation Activity & Risk Metrics
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Transaction count and risk profile progression across investigations
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#06D9FF] bg-[#06132D] px-2.5 py-1 rounded border border-white/5">
              Live Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06D9FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06D9FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#06132D" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#06132D',
                      borderColor: '#06D9FF',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#06D9FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                    name="Risk Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-lg">
                <Activity className="w-8 h-8 text-[#94A3B8]/40 mb-2" />
                <p className="text-xs text-[#94A3B8]">No investigation activity records yet.</p>
                <Link
                  to="/app/investigate"
                  className="mt-3 text-xs text-[#06D9FF] hover:underline"
                >
                  Run your first investigation →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Live Service Diagnostics Status */}
        <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Service Connectivity</h3>

          <div className="space-y-3 font-mono text-xs">
            {/* Backend API */}
            <div className="p-3 rounded-lg bg-[#06132D] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[#F8FAFC]">Backend API (Node)</span>
              </div>
              <span className="text-[#22C55E] text-[11px] font-bold">Port 4321</span>
            </div>

            {/* Python AI Engine */}
            <div className="p-3 rounded-lg bg-[#06132D] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-[#F8FAFC]">Python AI (FastAPI)</span>
              </div>
              <span
                className={`text-[11px] font-bold ${
                  health?.services.aiEngine.status === 'healthy' ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                }`}
              >
                {health?.services.aiEngine.status === 'healthy' ? 'Port 8000 (OK)' : 'Connecting...'}
              </span>
            </div>

            {/* Ethereum RPC */}
            <div className="p-3 rounded-lg bg-[#06132D] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#06D9FF]" />
                <span className="text-[#F8FAFC]">Ethereum JSON-RPC</span>
              </div>
              <span className="text-[#06D9FF] text-[11px] font-bold">
                {health?.services.ethereumRpc.status === 'healthy' ? 'Active' : 'Fallback'}
              </span>
            </div>

            {/* MongoDB Atlas */}
            <div className="p-3 rounded-lg bg-[#06132D] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#22C55E]" />
                <span className="text-[#F8FAFC]">Database Storage</span>
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                {health?.services.database.connectionState === 'connected' ? 'Atlas Connected' : 'Memory Cache'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Network Graph Preview (if cases exist) */}
      {latestWithGraph && (
        <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Latest Wallet Relationship Graph: {latestWithGraph.title}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Interactive transfer graph for {latestWithGraph.inputIdentifier}
              </p>
            </div>
            <Link
              to={`/app/results/${latestWithGraph._id || latestWithGraph.id}`}
              className="text-xs text-[#06D9FF] hover:underline flex items-center gap-1"
            >
              <span>View Full Case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CytoscapeGraph
            nodes={latestWithGraph.graphData.nodes}
            edges={latestWithGraph.graphData.edges}
            targetIdentifier={latestWithGraph.inputIdentifier}
            height="380px"
          />
        </div>
      )}

      {/* Recent Investigations Table */}
      <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Forensic Investigations</h3>
            <p className="text-xs text-[#94A3B8]">
              Previous wallet audits and transaction classifications
            </p>
          </div>
          <Link
            to="/app/history"
            className="text-xs text-[#06D9FF] hover:underline flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#06132D] text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Identifier / Title</th>
                <th className="py-3 px-4">Network</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investigations.length > 0 ? (
                investigations.map(inv => (
                  <tr
                    key={inv._id || inv.id}
                    className="hover:bg-[#102246]/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/results/${inv._id || inv.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F8FAFC] truncate max-w-xs">
                        {inv.title}
                      </div>
                      <span className="text-[10px] text-[#06D9FF]">
                        {inv.inputIdentifier.slice(0, 10)}...{inv.inputIdentifier.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] capitalize">{inv.network}</td>
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                      <div className="text-[#F8FAFC] flex items-center gap-1.5">
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
                    <td className="py-3 px-4">
                      <RiskScoreBadge
                        score={inv.riskAssessment?.risk_score}
                        classification={inv.riskAssessment?.risk_classification}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      {inv.isSampleData ? (
                        <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] border border-[#F59E0B]/30 font-bold">
                          SAMPLE DATA
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[10px]">LIVE RPC</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/app/results/${inv._id || inv.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2563EB]/20 text-[#06D9FF] hover:bg-[#2563EB] hover:text-white transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94A3B8] text-xs">
                    No forensic investigations recorded yet. Click "New Investigation" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
