import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLink = true }) => {
  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Geometric Hex Blockchain Symbol */}
      <div className="relative w-9 h-9 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#06D9FF] rounded-lg opacity-25 blur-sm group-hover:opacity-40 transition-opacity"></div>
        <div className="relative w-9 h-9 bg-[#0B1730] border border-[#06D9FF]/40 rounded-lg flex items-center justify-center shadow-glow-cyan">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2L20 6.5V17.5L12 22L4 17.5V6.5L12 2Z"
              stroke="#06D9FF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="#2563EB" />
            <circle cx="12" cy="12" r="1.5" fill="#06D9FF" />
            <line x1="12" y1="2" x2="12" y2="9" stroke="#06D9FF" strokeWidth="1.5" strokeDasharray="1 1" />
            <line x1="20" y1="17.5" x2="14.5" y2="13.5" stroke="#06D9FF" strokeWidth="1.5" strokeDasharray="1 1" />
            <line x1="4" y1="17.5" x2="9.5" y2="13.5" stroke="#06D9FF" strokeWidth="1.5" strokeDasharray="1 1" />
          </svg>
        </div>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-bold text-lg leading-tight">
          <span className="text-[#F8FAFC]">CHAIN</span>
          <span className="text-[#06D9FF] font-extrabold ml-0.5">FORENSICS</span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30 rounded">
            AI
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#94A3B8] tracking-wider uppercase">
          Blockchain Intelligence
        </span>
      </div>
    </div>
  );

  if (isLink) {
    return <Link to="/">{content}</Link>;
  }
  return content;
};
