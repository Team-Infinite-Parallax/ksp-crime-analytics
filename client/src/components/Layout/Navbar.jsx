import React, { useState } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Shield,
  User,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import VoiceSearch from '../Dashboard/VoiceSearch';

export default function Navbar({ activeRole, setActiveRole, searchTerm, setSearchTerm, userDetails, onVoiceFilters, isDarkMode, toggleDarkMode }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifications = [
    { id: 1, title: 'Burglary Spike Alert', desc: 'Geographic crime cluster detected in Bengaluru East (Shivajinagar PS).', time: '10m ago', type: 'warning' },
    { id: 2, title: 'Repeat Offender Flag', desc: 'Offender Rajesh Choudhary detected in Mysuru district.', time: '1h ago', type: 'danger' },
    { id: 3, title: 'Chargesheet Deadline', desc: 'Case CrimeNo 10045 pending chargesheet filing (Unit 2).', time: '4h ago', type: 'info' }
  ];

  const roles = [
    { id: 'SCRB_ADMIN', label: 'SCRB Admin (State)', badge: 'State-wide Access' },
    { id: 'DISTRICT_OFFICER', label: 'District Officer', badge: 'District: Bengaluru Urban' },
    { id: 'INVESTIGATION_OFFICER', label: 'Investigating Officer', badge: 'Station: Shivajinagar PS' }
  ];

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="relative w-96 group">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
            <Search className="h-[18px] w-[18px]" />
          </span>
          <input
            type="text"
            placeholder="Search suspects, FIR numbers, stations, sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-800 placeholder-[#8a887e] transition-all duration-200"
          />
        </div>
        <VoiceSearch onVoiceFilters={onVoiceFilters} activeRole={activeRole} />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer pr-2"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-950 text-slate-50">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-50 hover:bg-slate-900 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
              className="relative p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-50 hover:bg-slate-900 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#cc3333] rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#cc3333] rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <h3 className="text-sm font-bold text-slate-50">Notifications</h3>
                  <span className="text-[9px] bg-blue-900/50 text-blue-400 border border-slate-700 rounded-md px-1.5 py-0.5 font-bold uppercase">3 New</span>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 hover:bg-slate-900/50 rounded-xl transition-colors border border-transparent hover:border-slate-800 flex items-start space-x-3">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.type === 'warning' ? 'bg-blue-900/50 text-blue-400' :
                          notif.type === 'danger' ? 'bg-[#8b0000]/10 text-[#cc3333]' : 'bg-[#2b5f9e]/10 text-[#2b5f9e]'
                        }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-50">{notif.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{notif.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 hover:bg-slate-900/50 p-1.5 rounded-xl transition-colors"
          >
            <div className="h-9 w-9 bg-blue-600/50 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-slate-700 shadow-lg">
              {userDetails.firstName ? userDetails.firstName.charAt(0) : 'P'}
            </div>
            <div className="text-left hidden md:block">
              <h4 className="text-xs font-bold text-slate-50">{userDetails.firstName} {userDetails.lastName}</h4>
              <span className="text-[9px] text-slate-400 flex items-center space-x-1">
                <Shield className="h-3 w-3 text-blue-400 mr-0.5" />
                {userDetails.designation}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-3">
                <div className="h-10 w-10 bg-blue-600/50 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                  {userDetails.firstName ? userDetails.firstName.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-50">{userDetails.firstName} {userDetails.lastName}</h4>
                  <p className="text-[9px] text-slate-400">{userDetails.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Duty Station:</span>
                  <span className="text-slate-50 font-medium">{userDetails.unitName}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>District:</span>
                  <span className="text-slate-50 font-medium">{userDetails.districtName}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>ID Badge:</span>
                  <span className="text-slate-50 font-medium">#{userDetails.employeeID}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
