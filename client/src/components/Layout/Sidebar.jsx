import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  GitFork,
  UserX,
  Menu,
  ChevronLeft,
  LogOut,
  UserCheck,
  BarChart3
} from 'lucide-react';

const emblemSvg = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2v20M2 12h20" strokeWidth="1" opacity="0.3" />
    <path d="M12 6a6 6 0 0 0-6 6" fill="none" strokeWidth="1.5" />
    <path d="M12 18a6 6 0 0 0 6-6" fill="none" strokeWidth="1.5" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" strokeWidth="1" opacity="0.4" />
  </svg>
);

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hotspots', label: 'Crime Mapping', icon: MapPin },
    { id: 'network', label: 'Network Analysis', icon: GitFork },
    { id: 'risk', label: 'Risk Profiling', icon: UserX },
    { id: 'wanted', label: 'Wanted / Missing', icon: UserCheck },
    { id: 'reports', label: 'Data Reports', icon: BarChart3 },
  ];

  return (
    <div
      className={`h-screen bg-[#0a192f] border-r border-blue-900/30 shadow-2xl relative z-50 transition-all duration-300 ease-in-out flex flex-col justify-between ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div>
        <div className="p-4 flex items-center justify-between border-b border-[var(--color-hairline-dark)]">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-[var(--color-surface-elevated-dark)] p-2 rounded-lg">
                {emblemSvg}
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-primary)] font-semibold uppercase tracking-[0.15em]">Government of Karnataka</p>
                <h1 className="text-[14px] font-bold tracking-wider text-[var(--color-on-dark)] uppercase">KSP — CIP</h1>
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Intelligence Portal</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto bg-[var(--color-surface-elevated-dark)] p-2 rounded-lg">
              {emblemSvg}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[var(--color-muted)] hover:text-[var(--color-on-dark)] p-1.5 rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] border-l-2 border-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] border-l-2 border-transparent'
                  }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-on-dark)]'}`} />
                {!isCollapsed && <span className="text-[14px] tracking-wide font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-[var(--color-surface-elevated-dark)] text-[var(--color-on-dark)] text-[12px] px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[var(--color-hairline-dark)] shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[var(--color-hairline-dark)] bg-transparent space-y-3">
        {!isCollapsed && (
          <div className="bg-[var(--color-surface-elevated-dark)] rounded-xl p-3 flex items-start space-x-2">
            <Shield className="h-4 w-4 text-[var(--color-trading-down)] shrink-0 mt-0.5" />
            <div className="text-[10px]">
              <p className="font-bold text-[var(--color-trading-down)] uppercase tracking-wider">Classified</p>
              <p className="text-[var(--color-muted)] mt-0.5">Unauthorised access is punishable under law.</p>
            </div>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-2.5 text-[var(--color-muted)] hover:text-[var(--color-trading-down)] rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors group"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-[14px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
