import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SystemHealth } from '../types';
import { Activity, Shield, LogOut, User as UserIcon, Play, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const location = useLocation();
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await api.getHealth();
        setHealth(res);
      } catch {
        // Degraded or unreachable
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy';

  return (
    <nav className="sticky top-0 z-50 bg-[#020817]/90 backdrop-blur-md border-b border-[#06D9FF]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/app"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/app'
                ? 'bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/app/investigate"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/app/investigate'
                ? 'bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
            }`}
          >
            New Investigation
          </Link>
          <Link
            to="/app/network"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/app/network'
                ? 'bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
            }`}
          >
            Fund Tracing
          </Link>
          <Link
            to="/app/history"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/app/history'
                ? 'bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
            }`}
          >
            History
          </Link>
          <Link
            to="/app/reports"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/app/reports'
                ? 'bg-[#2563EB]/20 text-[#06D9FF] border border-[#06D9FF]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
            }`}
          >
            Reports
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Live System Health Pill */}
          <Link
            to="/app/settings"
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0B1730] border border-[#06D9FF]/20 text-[11px] font-mono hover:border-[#06D9FF]/50 transition-colors"
            title="Click to view full service diagnostic status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? 'bg-[#22C55E] animate-pulse' : 'bg-[#F59E0B]'
              }`}
            />
            <span className="text-[#94A3B8] hidden sm:inline">Engine:</span>
            <span className={isHealthy ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
              {isHealthy ? 'Online' : 'Degraded'}
            </span>
          </Link>

          {/* User State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#06132D] border border-white/10 rounded-md text-xs">
                <Shield className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span className="font-mono text-[#F8FAFC] max-w-[120px] truncate">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#0B1730] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={demoLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-md shadow-glow-blue transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Demo Access</span>
              </button>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730] rounded-md transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
