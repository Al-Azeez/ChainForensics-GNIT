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
      className={`fixed top-16 bottom-0 left-0 z-40 bg-[#06132D]/95 border-r border-[#06D9FF]/15 transition-all duration-300 flex flex-col justify-between ${
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#2563EB]/25 text-[#06D9FF] border border-[#06D9FF]/30 shadow-glow-cyan'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730]'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="px-3 text-[10px] font-mono uppercase text-[#94A3B8]/60 tracking-wider">
              Quick Resources
            </span>
            <div className="bg-[#0B1730] p-3 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#F8FAFC] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span>Forensics Rulebook</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] leading-tight">
                6 rule heuristics, Isolation Forest anomaly scoring & Random Forest classification.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[10px] font-mono text-[#94A3B8]/70">
            ChainForensics Core
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1730] transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
