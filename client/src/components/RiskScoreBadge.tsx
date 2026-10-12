import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface RiskScoreBadgeProps {
  score?: number | null;
  classification: string;
  confidence?: number;
  showGauge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScoreBadge: React.FC<RiskScoreBadgeProps> = ({
  score,
  classification,
  confidence,
  showGauge = false,
  size = 'md'
}) => {
  const getTheme = () => {
    switch (classification) {
      case 'Requires Further Review':
        return {
          bg: 'bg-[#EF4444]/15',
          border: 'border-[#EF4444]/40',
          text: 'text-[#EF4444]',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]',
          icon: AlertOctagon,
          label: 'Requires Further Review'
        };
      case 'Unusual Activity':
        return {
          bg: 'bg-[#F59E0B]/15',
          border: 'border-[#F59E0B]/40',
          text: 'text-[#F59E0B]',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          icon: AlertTriangle,
          label: 'Unusual Activity'
        };
      case 'No Major Anomaly Detected':
        return {
          bg: 'bg-[#22C55E]/15',
          border: 'border-[#22C55E]/40',
          text: 'text-[#22C55E]',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
          icon: ShieldCheck,
          label: 'No Major Anomaly'
        };
      default:
        return {
          bg: 'bg-[#94A3B8]/15',
          border: 'border-[#94A3B8]/30',
          text: 'text-[#94A3B8]',
          glow: '',
          icon: HelpCircle,
          label: 'Insufficient Data'
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  if (showGauge) {
    const strokeDashoffset = score !== undefined && score !== null
      ? 283 - (283 * Math.min(100, Math.max(0, score))) / 100
      : 283;

    return (
      <div className={`flex flex-col items-center p-6 rounded-xl bg-[#0B1730] border ${theme.border} ${theme.glow}`}>
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#06132D"
              strokeWidth="8"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={
                classification === 'Requires Further Review'
                  ? '#EF4444'
                  : classification === 'Unusual Activity'
                  ? '#F59E0B'
                  : classification === 'No Major Anomaly Detected'
                  ? '#22C55E'
                  : '#94A3B8'
              }
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {score !== undefined && score !== null ? (
              <>
                <span className="text-3xl font-extrabold font-mono text-[#F8FAFC]">
                  {Math.round(score)}
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  Risk Score
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold font-mono text-[#94A3B8]">
                  N/A
                </span>
                <span className="text-[9px] font-mono text-[#94A3B8] uppercase">
                  Data Low
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${theme.bg} ${theme.text} border ${theme.border}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{classification}</span>
          </div>

          {confidence !== undefined && (
            <span className="text-[11px] font-mono text-[#94A3B8]">
              Evidence Confidence: <strong className="text-[#F8FAFC]">{(confidence * 100).toFixed(0)}%</strong>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border ${theme.bg} ${theme.border} ${theme.text} ${
        size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{theme.label}</span>
      {score !== undefined && score !== null && (
        <span className="ml-1 px-1.5 py-0.2 rounded bg-black/30 font-mono text-[11px]">
          {score.toFixed(0)}/100
        </span>
      )}
    </div>
  );
};
