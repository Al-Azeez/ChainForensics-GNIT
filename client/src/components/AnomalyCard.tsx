import React from 'react';
import { AnomalyResult } from '../types';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AnomalyCardProps {
  anomaly: AnomalyResult;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  const scorePercent = Math.round(anomaly.anomaly_score * 100);

  return (
    <div className="rounded-xl bg-[#0B1730] border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#7C3AED]" />
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Isolation Forest Anomaly Engine</h3>
            <p className="text-[11px] text-[#94A3B8]">
              Unsupervised multivariate statistical outlier isolation
            </p>
          </div>
        </div>
        {anomaly.is_anomaly ? (
          <span className="px-2.5 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs font-semibold text-[#EF4444] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Outlier Detected
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 text-xs font-semibold text-[#22C55E] flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Normal Density
          </span>
        )}
      </div>

      {/* Metric Gauge Bar */}
      <div className="space-y-1.5 bg-[#06132D] p-3.5 rounded-lg border border-white/5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#94A3B8]">Anomaly Isolation Index</span>
          <span className={`font-bold ${anomaly.is_anomaly ? 'text-[#EF4444]' : 'text-[#06D9FF]'}`}>
            {scorePercent}/100
          </span>
        </div>
        <div className="w-full h-2 bg-[#0B1730] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              anomaly.is_anomaly
                ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                : 'bg-gradient-to-r from-[#2563EB] to-[#06D9FF]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, scorePercent))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]/60 pt-0.5">
          <span>0 (Baseline)</span>
          <span>50 (Threshold)</span>
          <span>100 (Extreme Outlier)</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-2 text-xs">
        <p className="text-[#94A3B8] leading-relaxed">{anomaly.explanation}</p>
        <div className="p-2.5 rounded bg-[#06132D] border border-white/5 text-[11px] text-[#94A3B8] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#06D9FF] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#F8FAFC]">Baseline Model:</strong> {anomaly.baseline_description}
          </span>
        </div>
      </div>
    </div>
  );
};
