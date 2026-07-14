import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';

export default function Filters() {
  const {
    filters,
    setFilters,
    districts,
    units,
    resetFilters: onReset,
    activeRole
  } = useFilters();
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
    <div className="card-dark p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
        <div className="flex items-center space-x-2 text-[var(--color-muted)] mr-2">
          <Filter className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.12em]">Filters</span>
        </div>

        <div className="relative">
          <select
            value={filters.districtId}
            disabled={activeRole !== 'SCRB_ADMIN'}
            onChange={(e) => setFilters({ ...filters, districtId: e.target.value, unitId: 'all' })}
            className={`bg-[var(--color-surface-elevated-dark)] border-none text-[var(--color-on-dark)] text-[14px] font-medium rounded-sm px-3 py-2 focus:outline-none cursor-pointer h-[40px] ${activeRole !== 'SCRB_ADMIN' ? 'opacity-60 cursor-not-allowed' : ''
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
            className={`bg-[var(--color-surface-elevated-dark)] border-none text-[var(--color-on-dark)] text-[14px] font-medium rounded-sm px-3 py-2 focus:outline-none cursor-pointer h-[40px] ${activeRole === 'INVESTIGATION_OFFICER' ? 'opacity-60 cursor-not-allowed' : ''
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
            className="bg-[var(--color-surface-elevated-dark)] border-none text-[var(--color-on-dark)] text-[14px] font-medium rounded-sm px-3 py-2 focus:outline-none cursor-pointer h-[40px]"
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
            className="bg-[var(--color-surface-elevated-dark)] border-none text-[var(--color-on-dark)] text-[14px] font-medium rounded-sm px-3 py-2 focus:outline-none cursor-pointer h-[40px]"
          >
            {gravities.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-transparent text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] transition-colors text-[14px] font-medium rounded-sm h-[40px]"
        >
          <RefreshCw className="h-4 w-4 shrink-0" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
