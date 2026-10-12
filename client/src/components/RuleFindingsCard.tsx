import React, { useState } from 'react';
import { RuleResult } from '../types';
import { ShieldAlert, CheckCircle2, AlertOctagon, ChevronDown, ChevronUp, Hash } from 'lucide-react';

interface RuleFindingsCardProps {
  rules: RuleResult[];
}

export const RuleFindingsCard: React.FC<RuleFindingsCardProps> = ({ rules }) => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const triggeredCount = rules.filter(r => r.triggered).length;

  const toggleExpand = (id: string) => {
    setExpandedRule(prev => (prev === id ? null : id));
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
      case 'HIGH':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      case 'MEDIUM':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'LOW':
        return 'bg-[#2563EB]/20 text-[#06D9FF] border-[#06D9FF]/30';
      default:
        return 'bg-white/5 text-[#94A3B8] border-white/10';
    }
  };

  return (
    <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#06D9FF]" />
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Forensic Rule Telemetry</h3>
            <p className="text-[11px] text-[#94A3B8]">
              Deterministic heuristics and threshold evaluations
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#06132D] border border-white/10 text-xs font-mono">
          <strong className={triggeredCount > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}>
            {triggeredCount}
          </strong>{' '}
          / {rules.length} Triggered
        </span>
      </div>

      <div className="space-y-2.5">
        {rules.map(rule => {
          const isExpanded = expandedRule === rule.rule_id;

          return (
            <div
              key={rule.rule_id}
              className={`rounded-lg border transition-all ${
                rule.triggered
                  ? 'bg-[#06132D]/90 border-[#EF4444]/30'
                  : 'bg-[#06132D]/40 border-white/5'
              }`}
            >
              <button
                onClick={() => toggleExpand(rule.rule_id)}
                className="w-full p-3.5 flex items-center justify-between text-left gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {rule.triggered ? (
                    <AlertOctagon className="w-4 h-4 text-[#EF4444] shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]/60 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-xs font-medium text-[#F8FAFC] block truncate">
                      {rule.rule_name}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      Observed: {rule.observed_value}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getSeverityBadge(
                      rule.severity
                    )}`}
                  >
                    {rule.severity}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2 text-xs">
                  <p className="text-[#94A3B8] leading-relaxed">{rule.explanation}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
                    <span className="text-[#94A3B8]">Threshold Marker:</span>
                    <span className="text-[#F8FAFC]">{rule.threshold}</span>
                  </div>

                  {rule.supporting_txs && rule.supporting_txs.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-[#94A3B8] uppercase flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#06D9FF]" /> Supporting Transactions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.supporting_txs.map(h => (
                          <span
                            key={h}
                            className="px-2 py-0.5 rounded bg-[#0B1730] border border-white/10 text-[10px] font-mono text-[#06D9FF]"
                          >
                            {h.slice(0, 10)}...{h.slice(-6)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
