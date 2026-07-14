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
      className={`h-screen bg-blue-950 border-r border-[var(--color-hairline-dark)] relative z-50 transition-all duration-300 ease-in-out flex flex-col justify-between ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div>
        <div className={`p-4 flex items-center border-b border-[var(--color-hairline-dark)] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-[var(--color-surface-elevated-dark)] p-2 rounded-lg border border-[var(--color-hairline-dark)]">
                {emblemSvg}
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-primary)] font-semibold uppercase tracking-[0.15em]">Govt of Karnataka</p>
                <h1 className="text-[14px] font-bold tracking-wider text-[var(--color-on-dark)] uppercase">KSP — CIP</h1>
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Intelligence Portal</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="bg-[var(--color-surface-elevated-dark)] p-2 rounded-lg border border-[var(--color-hairline-dark)]">
                {emblemSvg}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label="Expand sidebar"
                className="text-[var(--color-muted)] hover:text-[var(--color-on-dark)] p-1 rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Collapse sidebar"
              className="text-[var(--color-muted)] hover:text-[var(--color-on-dark)] p-1.5 rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isActive
                    ? 'bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] border border-[var(--color-hairline-dark)] shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] border border-transparent hover:translate-x-1'
                  }`}
              >
                <Icon className={`${isCollapsed ? 'h-7 w-7' : 'h-5 w-5'} transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-info)]'}`} />
                {!isCollapsed && <span className="text-[14px] tracking-wide font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-[var(--color-surface-elevated-dark)] text-[var(--color-on-dark)] text-[12px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-[var(--color-hairline-dark)] shadow-xl">
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
          <div className="bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-xl p-3 flex items-start space-x-2">
            <Shield className="h-4 w-4 text-[var(--color-trading-down)] shrink-0 mt-0.5" />
            <div className="text-[10px]">
              <p className="font-bold text-[var(--color-trading-down)] uppercase tracking-wider">Classified</p>
              <p className="text-[var(--color-muted)] mt-0.5 leading-tight">Unauthorised access is punishable under law.</p>
            </div>
          </div>
        )}

        <button 
          onClick={onLogout}
          aria-label="Logout"
          className={`w-full flex items-center p-2.5 text-[var(--color-muted)] hover:text-[var(--color-trading-down)] rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors group focus-visible:ring-2 focus-visible:ring-[var(--color-trading-down)] focus-visible:outline-none ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
        >
          <LogOut className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 group-hover:-translate-x-1 transition-transform`} />
          {!isCollapsed && <span className="text-[14px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
