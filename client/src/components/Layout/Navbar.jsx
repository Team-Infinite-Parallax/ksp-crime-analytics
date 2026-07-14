import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Shield,
  Sun,
  Moon
} from 'lucide-react';
import VoiceSearch from '../Dashboard/VoiceSearch';
import AlertBadge from '../Dashboard/AlertBadge';

export default function Navbar({ activeRole, setActiveRole, searchTerm, setSearchTerm, userDetails, onVoiceFilters, isDarkMode, toggleDarkMode, alertsOpen, setAlertsOpen }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const roles = [
    { id: 'SCRB_ADMIN', label: 'SCRB Admin (State)', badge: 'State-wide Access' },
    { id: 'DISTRICT_OFFICER', label: 'District Officer', badge: 'District: Bengaluru Urban' },
    { id: 'INVESTIGATION_OFFICER', label: 'Investigating Officer', badge: 'Station: Shivajinagar PS' }
  ];

  return (
    <header className="h-16 border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-navbar)] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 relative">
      <div className="flex items-center space-x-2 md:space-x-3 flex-grow max-w-[240px] sm:max-w-sm md:max-w-md lg:max-w-lg mr-2">
        <div className="relative w-full group">
          <label htmlFor="global-search" className="sr-only">Search</label>
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--color-muted)] transition-colors">
            <Search className="h-[18px] w-[18px]" />
          </span>
          <input
            id="global-search"
            type="text"
            placeholder="Search suspects, FIR numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] rounded-lg py-2.5 pl-10 pr-4 text-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200 h-[40px] shadow-inner"
          />
        </div>
        <VoiceSearch onVoiceFilters={onVoiceFilters} activeRole={activeRole} />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 flex-shrink-0">
        <div className="flex items-center space-x-2 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-lg px-2.5 py-1.5 sm:px-3">
          <label htmlFor="role-select" className="text-[12px] text-[var(--color-muted)] font-bold uppercase tracking-wider hidden sm:inline">Role:</label>
          <select
            id="role-select"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="bg-transparent text-[14px] font-bold text-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus:outline-none cursor-pointer pr-2 max-w-[85px] sm:max-w-[130px] md:max-w-none truncate"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id} className="bg-[var(--color-surface-card-dark)] text-[var(--color-on-dark)]">
                {r.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider border-l border-[var(--color-hairline-dark)] pl-2 ml-1 hidden md:inline-block">For Demo</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2.5 bg-transparent text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <AlertBadge onClick={() => setAlertsOpen(!alertsOpen)} />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            aria-label="Toggle profile menu"
            aria-haspopup="true"
            aria-expanded={showProfileDropdown}
            className="flex items-center space-x-3 hover:bg-[var(--color-surface-elevated-dark)] p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
          >
            <div className="h-8 w-8 bg-[var(--color-primary)] rounded-[50%] flex items-center justify-center text-white font-bold">
              {userDetails.firstName ? userDetails.firstName.charAt(0) : 'P'}
            </div>
            <div className="text-left hidden md:block">
              <h4 className="text-[14px] font-bold text-[var(--color-on-dark)] leading-tight">{userDetails.firstName} {userDetails.lastName}</h4>
              <span className="text-[12px] text-[var(--color-muted)] flex items-center space-x-1 mt-0.5">
                <Shield className="h-3 w-3 text-[var(--color-primary)] mr-0.5" />
                {userDetails.designation}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl shadow-2xl p-4 z-50 text-[var(--color-body)]">
              <div className="flex items-center space-x-3 pb-3 border-b border-[var(--color-hairline-dark)] mb-3">
                <div className="h-10 w-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white font-bold border border-[var(--color-hairline-dark)] shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  {userDetails.firstName ? userDetails.firstName.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-on-dark)]">{userDetails.firstName} {userDetails.lastName}</h4>
                  <p className="text-[9px] text-[var(--color-muted)]">{userDetails.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--color-muted)] flex justify-between">
                  <span>Duty Station:</span>
                  <span className="text-[var(--color-on-dark)] font-medium">{userDetails.unitName}</span>
                </div>
                <div className="text-[10px] text-[var(--color-muted)] flex justify-between">
                  <span>District:</span>
                  <span className="text-[var(--color-on-dark)] font-medium">{userDetails.districtName}</span>
                </div>
                <div className="text-[10px] text-[var(--color-muted)] flex justify-between">
                  <span>ID Badge:</span>
                  <span className="text-[var(--color-on-dark)] font-medium">#{userDetails.employeeID}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
