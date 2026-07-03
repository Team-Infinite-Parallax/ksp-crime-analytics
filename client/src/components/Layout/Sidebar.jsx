import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  GitFork,
  UserX,
  Menu,
  ChevronLeft,
  LogOut
} from 'lucide-react';

const emblemSvg = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2v20M2 12h20" strokeWidth="1" opacity="0.3" />
    <path d="M12 6a6 6 0 0 0-6 6" fill="none" strokeWidth="1.5" />
    <path d="M12 18a6 6 0 0 0 6-6" fill="none" strokeWidth="1.5" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" strokeWidth="1" opacity="0.4" />
  </svg>
);

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hotspots', label: 'Crime Mapping', icon: MapPin },
    { id: 'network', label: 'Network Analysis', icon: GitFork },
    { id: 'risk', label: 'Risk Profiling', icon: UserX },
  ];

  return (
    <div
      className={`h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col justify-between ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-blue-900/50 p-2 rounded-lg border border-slate-700">
                {emblemSvg}
              </div>
              <div>
                <p className="text-[9px] text-blue-400/60 font-semibold uppercase tracking-[0.15em]">Government of Karnataka</p>
                <h1 className="text-sm font-bold tracking-wider text-slate-50 uppercase">KSP — CIP</h1>
                <p className="text-[9px] text-slate-400 font-medium">Intelligence Portal</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto bg-blue-900/50 p-2 rounded-lg border border-slate-700">
              {emblemSvg}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-50 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
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
                    ? 'bg-blue-900/50 text-blue-400 border-l-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-900 border-l-2 border-transparent'
                  }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-50'}`} />
                {!isCollapsed && <span className="text-sm tracking-wide font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-slate-950 text-slate-50 text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-3">
        {!isCollapsed && (
          <div className="bg-[#8b0000]/10 border border-[#8b0000]/30 rounded-xl p-3 flex items-start space-x-2">
            <Shield className="h-4 w-4 text-[#8b0000] shrink-0 mt-0.5" />
            <div className="text-[10px]">
              <p className="font-bold text-[#cc3333] uppercase tracking-wider">Classified</p>
              <p className="text-slate-400 mt-0.5">Unauthorised access is punishable under law.</p>
            </div>
          </div>
        )}

        <button className="w-full flex items-center space-x-3 p-2.5 text-slate-400 hover:text-[#cc3333] rounded-lg hover:bg-[#8b0000]/5 transition-colors group">
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
