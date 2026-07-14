import React, { useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  GitFork,
  UserX,
  LogOut,
  UserCheck,
  BarChart3,
  X
} from 'lucide-react';

const emblemSvg = (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2v20M2 12h20" strokeWidth="1" opacity="0.3" />
    <path d="M12 6a6 6 0 0 0-6 6" fill="none" strokeWidth="1.5" />
    <path d="M12 18a6 6 0 0 0 6-6" fill="none" strokeWidth="1.5" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" strokeWidth="1" opacity="0.4" />
  </svg>
);

/**
 * Sidebar component — always renders as a fixed off-canvas drawer.
 * Controlled via isMobileOpen / onMobileClose props.
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active navigation tab
 * @param {Function} props.setActiveTab - Tab setter
 * @param {Function} props.onLogout - Logout handler
 * @param {boolean} props.isMobileOpen - Drawer open state
 * @param {Function} props.onMobileClose - Close drawer
 */
export default function Sidebar({ activeTab, setActiveTab, onLogout, isMobileOpen, onMobileClose }) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onMobileClose) onMobileClose();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) onMobileClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isMobileOpen, onMobileClose]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hotspots', label: 'Crime Mapping', icon: MapPin },
    { id: 'network', label: 'Network Analysis', icon: GitFork },
    { id: 'risk', label: 'Risk Profiling', icon: UserX },
    { id: 'wanted', label: 'Wanted / Missing', icon: UserCheck },
    { id: 'reports', label: 'Data Reports', icon: BarChart3 },
  ];

  return (
    <>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] flex">
            <div className="h-full w-full bg-[var(--color-surface-sidebar)] border-r border-[var(--color-hairline-dark)] flex flex-col justify-between overflow-y-auto overflow-x-hidden">
              {/* Header with close button */}
              <div>
                <div className="p-4 flex items-center justify-between border-b border-[var(--color-hairline-dark)]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="bg-[var(--color-surface-elevated-dark)] p-2 rounded-lg border border-[var(--color-hairline-dark)] shrink-0">
                      {emblemSvg}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--color-primary)] font-semibold uppercase tracking-[0.15em]">Govt of Karnataka</p>
                      <h1 className="text-[14px] font-bold tracking-wider text-[var(--color-on-dark)] uppercase">KSP — CIP</h1>
                      <p className="text-[11px] text-[var(--color-muted)] font-medium">Intelligence Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={onMobileClose}
                    aria-label="Close navigation menu"
                    className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] transition-colors shrink-0 ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none ${isActive
                            ? 'bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] border border-[var(--color-hairline-dark)] shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] border border-transparent hover:translate-x-1'
                          }`}
                      >
                        <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-info)]'}`} />
                        <span className="text-[14px] tracking-wide font-medium truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-[var(--color-hairline-dark)] bg-transparent space-y-3">
                <div className="bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-xl p-3 flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-[var(--color-trading-down)] shrink-0 mt-0.5" />
                  <div className="text-[10px] min-w-0">
                    <p className="font-bold text-[var(--color-trading-down)] uppercase tracking-wider">Classified</p>
                    <p className="text-[var(--color-muted)] mt-0.5 leading-tight">Unauthorised access is punishable under law.</p>
                  </div>
                </div>

                <button
                  onClick={() => { onLogout(); if (onMobileClose) onMobileClose(); }}
                  aria-label="Logout"
                  className="w-full flex items-center space-x-3 p-2.5 text-[var(--color-muted)] hover:text-[var(--color-trading-down)] rounded-lg hover:bg-[var(--color-surface-elevated-dark)] transition-colors group focus-visible:ring-2 focus-visible:ring-[var(--color-trading-down)] focus-visible:outline-none"
                >
                  <LogOut className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[14px] font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
