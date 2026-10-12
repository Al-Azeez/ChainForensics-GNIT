import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Share2,
  Cpu,
  History,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/investigate', label: 'New Investigation', icon: Search },
    { to: '/app/network', label: 'Wallet Network', icon: Share2 },
    { to: '/app/history', label: 'Investigation History', icon: History },
    { to: '/app/reports', label: 'Reports', icon: FileText },
    { to: '/app/settings', label: 'System & Diagnostics', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-40 bg-slate-950/65 backdrop-blur-2xl border-r border-white/15 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 space-y-4">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 via-amber-500/15 to-transparent border-l-4 border-amber-400 text-white shadow-[0_0_16px_rgba(245,158,11,0.2)] font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    {!collapsed && <span className="tracking-wide">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="px-3 text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">
              Quick Resources
            </span>
            <div className="p-3 rounded-lg bg-slate-900/70 backdrop-blur-md border border-white/15 hover:border-amber-400/50 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] transition cursor-pointer group">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-400 group-hover:text-amber-400 transition" />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition">
                  Forensics Rulebook
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                6 rule heuristics, Isolation Forest anomaly scoring & Random Forest classification.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-mono text-slate-400">
            ChainForensics Core
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
