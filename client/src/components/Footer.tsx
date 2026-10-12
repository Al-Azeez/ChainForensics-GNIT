import React from 'react';
import { Logo } from './Logo';
import { ShieldAlert, Cpu, Terminal, Database, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020817] border-t border-[#06D9FF]/15 text-[#94A3B8] text-xs">
      {/* Educational Disclaimer Banner */}
      <div className="bg-[#0B1730]/80 border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#94A3B8]">
            <strong className="text-[#F8FAFC]">Forensic Disclaimer & Principle:</strong> ChainForensics provides statistical heuristics, explainable machine learning models, and rule-based anomaly detection to assist human investigators. Automated risk classifications must never be presented as definitive proof of criminal activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-3">
          <Logo isLink={false} />
          <p className="text-xs text-[#94A3B8] max-w-md leading-relaxed">
            AI-Powered Blockchain Intelligence & Forensics Platform. Investigate cryptocurrency transactions, explore multi-hop wallet relationships, and inspect evidence-based risk assessments with explainable telemetry.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2 py-0.5 rounded bg-[#06132D] border border-white/10 text-[10px] font-mono flex items-center gap-1 text-[#06D9FF]">
              <Cpu className="w-3 h-3" /> Python FastAPI + scikit-learn
            </span>
            <span className="px-2 py-0.5 rounded bg-[#06132D] border border-white/10 text-[10px] font-mono flex items-center gap-1 text-[#2563EB]">
              <Terminal className="w-3 h-3" /> Express + TypeScript
            </span>
            <span className="px-2 py-0.5 rounded bg-[#06132D] border border-white/10 text-[10px] font-mono flex items-center gap-1 text-[#22C55E]">
              <Database className="w-3 h-3" /> MongoDB Atlas
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#F8FAFC] font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/app" className="hover:text-[#06D9FF] transition-colors">Forensic Dashboard</a></li>
            <li><a href="/app/investigate" className="hover:text-[#06D9FF] transition-colors">New Investigation</a></li>
            <li><a href="/app/network" className="hover:text-[#06D9FF] transition-colors">Interactive Fund Tracing</a></li>
            <li><a href="/app/history" className="hover:text-[#06D9FF] transition-colors">Case History Archive</a></li>
            <li><a href="/app/reports" className="hover:text-[#06D9FF] transition-colors">Executive Reports</a></li>
          </ul>
        </div>

        {/* Technical Specs */}
        <div>
          <h4 className="text-[#F8FAFC] font-semibold text-xs uppercase tracking-wider mb-3">Architecture</h4>
          <ul className="space-y-2 text-xs font-mono text-[11px]">
            <li className="flex justify-between">
              <span>Classifier:</span>
              <span className="text-[#06D9FF]">Random Forest (v1.0)</span>
            </li>
            <li className="flex justify-between">
              <span>Anomaly:</span>
              <span className="text-[#06D9FF]">Isolation Forest</span>
            </li>
            <li className="flex justify-between">
              <span>Rule Engine:</span>
              <span className="text-[#06D9FF]">Ruleset v2.1.0</span>
            </li>
            <li className="flex justify-between">
              <span>Network:</span>
              <span className="text-[#F8FAFC]">Ethereum (JSON-RPC)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
        <span>© 2026 ChainForensics. Built for serious blockchain investigative intelligence.</span>
        <span className="font-mono text-[#06D9FF]/70">v1.0.0-production-grade</span>
      </div>
    </footer>
  );
};
