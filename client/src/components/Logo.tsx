import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLink = true }) => {
  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Geometric Hex Blockchain Symbol with Red-Amber-Blue Gradient Border */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 via-amber-500 to-blue-600 p-[1.5px] shadow-[0_0_16px_rgba(245,158,11,0.45)] group-hover:shadow-[0_0_22px_rgba(245,158,11,0.7)] transition-all">
        <div className="w-full h-full rounded-[7px] bg-slate-950/85 backdrop-blur-md flex items-center justify-center text-amber-400">
          <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
            <path
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold tracking-wider text-base text-white">
            CHAIN<span className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">FORENSICS</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 leading-none">
            AI
          </span>
        </div>
        <span className="text-[9px] font-mono tracking-widest text-slate-300 font-semibold mt-1">
          BLOCKCHAIN INTELLIGENCE
        </span>
      </div>
    </div>
  );

  if (isLink) {
    return <Link to="/">{content}</Link>;
  }
  return content;
};
