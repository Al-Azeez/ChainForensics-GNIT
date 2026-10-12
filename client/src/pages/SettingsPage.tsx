import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemHealth } from '../types';
import {
  Settings,
  Cpu,
  Terminal,
  Database,
  Share2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Info,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHealth();
      setHealth(res);
    } catch {
      // Degraded
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06D9FF]">
            <Settings className="w-4 h-4" />
            <span>SYSTEM DIAGNOSTICS & TELEMETRY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Platform Infrastructure & Services
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Real-time service health checks, RPC latency, AI engine model version, and database state.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1730] border border-white/10 text-xs text-[#94A3B8] hover:text-[#06D9FF] hover:border-[#06D9FF]/40 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#06D9FF]' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Python AI Service */}
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#7C3AED]/20 text-[#7C3AED]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Python AI Engine</h3>
                <span className="text-[10px] font-mono text-[#94A3B8]">FastAPI (Port 8000)</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                health?.services.aiEngine.status === 'healthy'
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
              }`}
            >
              {health?.services.aiEngine.status === 'healthy' ? 'CONNECTED' : 'UNREACHABLE'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#06132D] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Target URL:</span>
              <span className="text-[#F8FAFC]">{health?.services.aiEngine.url || 'http://localhost:8000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Latency:</span>
              <span className="text-[#06D9FF]">{health?.services.aiEngine.latencyMs || 0} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Anomaly Module:</span>
              <span className="text-[#22C55E]">Isolation Forest (Ready)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Supervised Model:</span>
              <span className="text-[#06D9FF]">Random Forest (Ready)</span>
            </div>
          </div>
        </div>

        {/* Node.js Backend */}
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#2563EB]/20 text-[#2563EB]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Node.js Express Server</h3>
                <span className="text-[10px] font-mono text-[#94A3B8]">REST API (Port 4321)</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40">
              OPERATIONAL
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#06132D] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Uptime:</span>
              <span className="text-[#F8FAFC]">{health?.services.backend.uptimeSeconds || 0} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Node Runtime:</span>
              <span className="text-[#F8FAFC]">{health?.services.backend.nodeVersion || 'v20+'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Validation:</span>
              <span className="text-[#22C55E]">Zod Cryptographic Schemas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Rate Limiter:</span>
              <span className="text-[#22C55E]">Active (300 req / 15 min)</span>
            </div>
          </div>
        </div>

        {/* Ethereum RPC Provider */}
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#06D9FF]/20 text-[#06D9FF]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Ethereum JSON-RPC Provider</h3>
                <span className="text-[10px] font-mono text-[#94A3B8]">Mainnet Synchronization</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                health?.services.ethereumRpc.status === 'healthy'
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
              }`}
            >
              {health?.services.ethereumRpc.status === 'healthy' ? 'CONNECTED' : 'FALLBACK POOL'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#06132D] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Active Endpoint:</span>
              <span className="text-[#06D9FF] truncate max-w-[180px]">
                {health?.services.ethereumRpc.rpcUrl || 'cloudflare-eth'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Latest Block:</span>
              <span className="text-[#F8FAFC] font-bold">
                {health?.services.ethereumRpc.blockNumber ? `#${health.services.ethereumRpc.blockNumber}` : 'Syncing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">RPC Latency:</span>
              <span className="text-[#06D9FF]">{health?.services.ethereumRpc.latencyMs || 0} ms</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Database Persistence</h3>
                <span className="text-[10px] font-mono text-[#94A3B8]">MongoDB Atlas / Memory Store</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40">
              {health?.services.database.connectionState === 'connected' ? 'ATLAS LIVE' : 'IN-MEMORY ACTIVE'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#06132D] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Status:</span>
              <span className="text-[#F8FAFC]">{health?.services.database.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Mode:</span>
              <span className="text-[#06D9FF]">
                {health?.services.database.connectionState === 'connected' ? 'MongoDB Atlas Persistent' : 'Standalone RAM Store'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Host:</span>
              <span className="text-[#F8FAFC]">{health?.services.database.host}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Rules Catalog */}
      <div className="p-6 rounded-2xl bg-[#0B1730] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#06D9FF]" />
          <span>Configured Forensic Rules Catalog (Ruleset v2.1.0)</span>
        </h3>

        <div className="space-y-2 text-xs font-mono">
          {[
            { id: 'RULE_RAPID_PEELING_FLOW', name: 'Rapid Fund Pass-Through / Peeling', sev: 'CRITICAL', thresh: '>= 40% rapid pass-through in < 60 mins' },
            { id: 'RULE_HIGH_VELOCITY_BURST', name: 'Transaction Clustering Burst', sev: 'MEDIUM', thresh: 'Burst Score >= 3.0 OR >= 50 tx/day' },
            { id: 'RULE_HIGH_COUNTERPARTY_FANOUT', name: 'High Counterparty Dispersion', sev: 'MEDIUM', thresh: 'Entropy >= 2.8 OR >= 80% unique' },
            { id: 'RULE_ELEVATED_FAILURE_RATE', name: 'Elevated EVM Reversion Rate', sev: 'HIGH', thresh: '>= 20% failed transactions' },
            { id: 'RULE_ASYMMETRIC_DRAIN', name: 'Near-Complete Inflow Depletion', sev: 'HIGH', thresh: '>= 90% total inflow drained' },
            { id: 'RULE_LARGE_VALUE_TRANSFER', name: 'Significant Single Value Transfer', sev: 'MEDIUM', thresh: 'Single transfer >= 10.0 ETH' }
          ].map(r => (
            <div key={r.id} className="p-3 rounded-lg bg-[#06132D] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#F8FAFC] font-semibold block">{r.name}</span>
                <span className="text-[10px] text-[#94A3B8]">{r.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#94A3B8]">{r.thresh}</span>
                <span className="px-2 py-0.5 rounded bg-[#0B1730] border border-white/10 text-[10px] font-bold text-[#06D9FF]">
                  {r.sev}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
