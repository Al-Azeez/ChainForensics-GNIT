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
    <header className="sticky top-0 z-50 border-b border-white/15 bg-slate-950/70 backdrop-blur-xl px-4 lg:px-6 h-16 flex items-center justify-between shadow-lg shadow-black/20">
      <div className="w-full max-w-[1750px] mx-auto flex items-center justify-between">
        {/* Left: Logo & Core Navigation */}
        <div className="flex items-center space-x-6">
          <Logo />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium ml-4">
            <Link
              to="/app"
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                location.pathname === '/app'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/app/investigate"
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                location.pathname === '/app/investigate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              New Investigation
            </Link>
            <Link
              to="/app/network"
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                location.pathname === '/app/network'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Fund Tracing
            </Link>
            <Link
              to="/app/history"
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                location.pathname === '/app/history'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              History
            </Link>
            <Link
              to="/app/reports"
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                location.pathname === '/app/reports'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Reports
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Live System Health Pill */}
          <Link
            to="/app/settings"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-xs font-mono shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-amber-400/60 transition-colors"
            title="Click to view full service diagnostic status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] animate-pulse'
                  : 'bg-amber-400 status-pulse-amber animate-pulse'
              }`}
            />
            <span className="text-slate-300 hidden sm:inline">Engine:</span>
            <span className={isHealthy ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isHealthy ? 'Online' : 'Degraded'}
            </span>
          </Link>

          {/* User State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 border border-white/15 rounded-md text-xs">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-white max-w-[120px] truncate">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-slate-300 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={demoLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-md rby-red-glow transition border border-rose-400/40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Demo Access</span>
              </button>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-200 hover:text-amber-300 px-2 py-1.5 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
