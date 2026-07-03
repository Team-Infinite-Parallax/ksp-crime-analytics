import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

export default function Filters({
  filters,
  setFilters,
  districts,
  units,
  onReset,
  activeRole
}) {
  const dateRanges = [
    { id: '30days', label: 'Last 30 Days' },
    { id: '90days', label: 'Last 90 Days' },
    { id: '1year', label: 'Last 12 Months' },
    { id: 'ytd', label: 'Year To Date' }
  ];

  const gravities = [
    { id: 'all', label: 'All Severities' },
    { id: '1', label: 'Heinous Crimes Only' },
    { id: '2', label: 'Non-Heinous Crimes' }
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900 flex flex-wrap gap-4 items-center justify-between shadow-lg">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-2 text-slate-400 mr-2">
          <Filter className="h-4 w-4 text-blue-400" />
          <span className="text-[9px] font-bold uppercase tracking-[0.12em]">Filters</span>
        </div>

        <div className="relative">
          <select
            value={filters.districtId}
            disabled={activeRole !== 'SCRB_ADMIN'}
            onChange={(e) => setFilters({ ...filters, districtId: e.target.value, unitId: 'all' })}
            className={`bg-slate-950 border border-slate-700 text-slate-50 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer ${activeRole !== 'SCRB_ADMIN' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            <option value="all">All Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters.unitId}
            disabled={activeRole === 'INVESTIGATION_OFFICER'}
            onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
            className={`bg-slate-950 border border-slate-700 text-slate-50 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer ${activeRole === 'INVESTIGATION_OFFICER' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            <option value="all">All Stations</option>
            {units
              .filter(u => filters.districtId === 'all' || Number(u.districtId) === Number(filters.districtId))
              .map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))
            }
          </select>
        </div>

        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-slate-50 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {dateRanges.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters.gravity}
            onChange={(e) => setFilters({ ...filters, gravity: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-slate-50 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {gravities.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-950 border border-slate-700 text-slate-400 hover:text-slate-50 hover:border-blue-500/40 transition-colors text-xs font-bold rounded-xl"
        >
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
