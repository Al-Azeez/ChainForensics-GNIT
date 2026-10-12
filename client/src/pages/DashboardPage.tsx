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
      {/* Top Title Bar & Search Command */}
      <section className="space-y-5" data-purpose="command-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 font-headline drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]">
              Forensic Operations Command
            </h1>
            <p className="text-sm text-slate-200 mt-1 font-body">
              Monitor blockchain transaction flows, evaluate anomaly markers, and launch deep investigations.
            </p>
          </div>

          {/* Top-right Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="w-9 h-9 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-slate-200 hover:text-amber-300 hover:border-amber-400/60 hover:shadow-[0_0_14px_rgba(245,158,11,0.3)] transition"
              title="Refresh state"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* New Investigation Button */}
            <Link
              to="/app/investigate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg rby-amber-glow border border-amber-400/40 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Investigation</span>
            </Link>
          </div>
        </div>

        {/* Global Address Search Bar */}
        <form onSubmit={handleQuickAnalyze} className="relative w-full">
          <div className="flex items-center rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/20 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40 focus-within:shadow-[0_0_24px_rgba(245,158,11,0.3)] transition-all p-1.5 shadow-xl">
            <div className="pl-3.5 pr-2 text-blue-400">
              <Search className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
            </div>
            <input
              type="text"
              placeholder="Quick search Ethereum address (0x...) or transaction hash..."
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-400 focus:ring-0 focus:outline-none py-1.5 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide transition shrink-0 shadow-md border border-blue-400/40 font-label shadow-blue-500/20"
            >
              Inspect
            </button>
          </div>
        </form>
      </section>

      {/* BEGIN: KPI Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary">
        {/* Card 1: TOTAL INVESTIGATIONS */}
        <div className="rby-panel rby-panel-blue rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span className="tracking-wider">TOTAL INVESTIGATIONS</span>
            <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {totalCount}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {totalCount > 0 ? 'Persisted in database & memory' : 'No saved cases yet'}
          </div>
        </div>

        {/* Card 2: TRANSACTIONS ANALYZED */}
        <div className="rby-panel rby-panel-amber rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span className="tracking-wider">TRANSACTIONS ANALYZED</span>
            <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {totalTxAnalyzed}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {totalEthVolume.toFixed(2)} ETH cumulative volume
          </div>
        </div>

        {/* Card 3: REQUIRES REVIEW */}
        <div className="rby-panel rby-panel-red rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span className="tracking-wider">REQUIRES REVIEW</span>
            <span className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-red-400 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
              {reviewCount}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            High-risk or critical rule triggers
          </div>
        </div>

        {/* Card 4: AI ENGINE STATUS */}
        <div className="rby-panel rby-panel-amber rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
            <span className="tracking-wider">AI ENGINE STATUS</span>
            <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health?.services.aiEngine.status === 'healthy'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] animate-pulse'
                  : 'bg-amber-400 status-pulse-amber'
              }`}
            />
            <span
              className={`text-2xl font-bold font-mono tracking-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] ${
                health?.services.aiEngine.status === 'healthy' ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {health?.services.aiEngine.status === 'healthy' ? 'Online' : 'Degraded'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            FastAPI + Isolation Forest
          </div>
        </div>
      </section>
      {/* END: KPI Metrics Grid */}

      {/* BEGIN: Telemetry and Service Connectivity Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" data-purpose="telemetry-connectivity">
        {/* Left: Investigation Activity & Risk Metrics (Telemetry Chart Area) */}
        <div className="lg:col-span-8 rby-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white font-headline">
                Investigation Activity & Risk Metrics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-blue-300 bg-blue-500/20 border border-blue-400/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-300 font-body">
              Transaction count and risk profile progression across investigations
            </p>
          </div>

          {/* Chart Canvas */}
          <div className="my-4 min-h-[190px] rounded-lg border border-white/15 bg-slate-950/75 rby-grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden group">
            {chartData.length > 0 ? (
              <div className="h-48 w-full z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRiskRBY" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#BE123C" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0c1222',
                        borderColor: '#F59E0B',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#ffffff'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRiskRBY)"
                      name="Risk Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <>
                {/* Glowing Waveform in Background with Red-Amber Blend */}
                <svg
                  className="absolute inset-x-0 bottom-4 w-full h-16 stroke-amber-500/50 stroke-[2] fill-none drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 100"
                >
                  <path d="M0,50 L120,50 L140,20 L160,80 L180,45 L190,55 L200,50 L340,50 L355,10 L370,90 L385,50 L500,50" />
                </svg>
                <div className="relative z-10 text-center space-y-2 py-6">
                  <p className="text-sm text-slate-200">
                    No investigation activity records yet.
                  </p>
                  <Link
                    to="/app/investigate"
                    className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
                  >
                    Run your first investigation <span className="ml-1">→</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Service Connectivity Status */}
        <div className="lg:col-span-4 rby-panel rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-base font-bold text-white font-headline">Service Connectivity</h2>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {/* Service 1: Backend API */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-blue-500/30 hover:border-blue-400/60 transition shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-200 font-sans">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold font-mono text-white">Backend API (Node)</span>
              </div>
              <span className="text-blue-400 font-semibold drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">
                Port 4321
              </span>
            </div>

            {/* Service 2: Python AI */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-amber-500/30 hover:border-amber-400/60 transition shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-200 font-sans">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold font-mono text-white">Python AI (FastAPI)</span>
              </div>
              <span
                className={`font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] ${
                  health?.services.aiEngine.status === 'healthy'
                    ? 'text-emerald-400'
                    : 'text-amber-400 animate-pulse'
                }`}
              >
                {health?.services.aiEngine.status === 'healthy' ? 'Port 8000 (OK)' : 'Connecting...'}
              </span>
            </div>

            {/* Service 3: Ethereum JSON-RPC */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-blue-500/30 hover:border-blue-400/60 transition shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-200 font-sans">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold font-mono text-white">Ethereum JSON-RPC</span>
              </div>
              <span className="text-blue-300 font-semibold drop-shadow-[0_0_6px_rgba(147,197,253,0.5)]">
                {health?.services.ethereumRpc.status === 'healthy' ? 'Active' : 'Fallback'}
              </span>
            </div>

            {/* Service 4: Database Storage */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-white/10 hover:border-amber-400/40 transition shadow-sm">
              <div className="flex items-center gap-2.5 text-slate-200 font-sans">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold font-mono text-white">Database Storage</span>
              </div>
              <span className="text-slate-300 font-medium">
                {health?.services.database.connectionState === 'connected' ? 'Atlas Connected' : 'Memory Cache'}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END: Telemetry and Service Connectivity Section */}

      {/* Interactive Network Graph Preview (if cases exist) */}
      {latestWithGraph && (
        <div className="rby-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Latest Wallet Relationship Graph: {latestWithGraph.title}
              </h3>
              <p className="text-xs text-slate-300">
                Interactive transfer graph for {latestWithGraph.inputIdentifier}
              </p>
            </div>
            <Link
              to={`/app/results/${latestWithGraph._id || latestWithGraph.id}`}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
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

      {/* BEGIN: RecentForensicInvestigationsTable */}
      <section className="rby-panel rounded-xl p-5 overflow-hidden" data-purpose="cases-table">
        {/* Table Header & View Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-headline">Recent Forensic Investigations</h2>
            <p className="text-xs text-slate-300 font-body">
              Previous wallet audits and transaction classifications
            </p>
          </div>
          <Link
            to="/app/history"
            className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            View All Cases <span className="ml-1">→</span>
          </Link>
        </div>

        {/* Table Structure */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-semibold border-b border-white/15">
                <th className="py-3 px-4" scope="col">IDENTIFIER / TITLE</th>
                <th className="py-3 px-4" scope="col">NETWORK</th>
                <th className="py-3 px-4" scope="col">TIMESTAMP</th>
                <th className="py-3 px-4" scope="col">CLASSIFICATION</th>
                <th className="py-3 px-4" scope="col">DATA SOURCE</th>
                <th className="py-3 px-4 text-right" scope="col">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investigations.length > 0 ? (
                investigations.map(inv => (
                  <tr
                    key={inv._id || inv.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/results/${inv._id || inv.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F8FAFC] truncate max-w-xs">
                        {inv.title}
                      </div>
                      <span className="text-[10px] text-blue-400">
                        {inv.inputIdentifier.slice(0, 10)}...{inv.inputIdentifier.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{inv.network}</td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="text-[#F8FAFC] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(inv.analysisTimestamp).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-400/70" />
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
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] border border-amber-400/40 font-bold">
                          SAMPLE DATA
                        </span>
                      ) : (
                        <span className="text-blue-300 text-[10px]">LIVE RPC</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/app/results/${inv._id || inv.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-slate-400 text-xs font-mono">
                        No forensic investigations recorded yet. Click "New Investigation" to begin.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* END: RecentForensicInvestigationsTable */}
    </div>
  );
};
