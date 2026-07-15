import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { getUserDetailsByRole, districts, units } from '../data/constants';

const FilterContext = createContext(null);

export function FilterProvider({ children, isLoggedIn, onLogout, isDarkMode, toggleDarkMode }) {
  const [activeRole, setActiveRole] = useState('SCRB_ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [filters, setFilters] = useState({
    districtId: 'all',
    unitId: 'all',
    dateRange: '30days',
    gravity: 'all'
  });

  const userDetails = useMemo(() => getUserDetailsByRole(activeRole), [activeRole]);

  // Synchronize filters when activeRole changes
  useEffect(() => {
    if (activeRole === 'DISTRICT_OFFICER') {
      setFilters(f => ({ ...f, districtId: '1', unitId: 'all' }));
    } else if (activeRole === 'INVESTIGATION_OFFICER') {
      setFilters(f => ({ ...f, districtId: '1', unitId: '1' }));
    } else {
      setFilters(f => ({ ...f, districtId: 'all', unitId: 'all' }));
    }
  }, [activeRole]);
  
  const resetFilters = useCallback(() => {
    if (activeRole === 'DISTRICT_OFFICER') {
      setFilters({ districtId: '1', unitId: 'all', dateRange: '30days', gravity: 'all' });
    } else if (activeRole === 'INVESTIGATION_OFFICER') {
      setFilters({ districtId: '1', unitId: '1', dateRange: '30days', gravity: 'all' });
    } else {
      setFilters({ districtId: 'all', unitId: 'all', dateRange: '30days', gravity: 'all' });
    }
    setSearchTerm('');
  }, [activeRole]);

  const handleVoiceFilters = (newFilters, _queryText) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    if (newFilters.searchTerm) {
      setSearchTerm(newFilters.searchTerm);
    }
  };

  const value = useMemo(() => ({
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    activeRole,
    setActiveRole,
    isDarkMode,
    toggleDarkMode,
    alertsOpen,
    setAlertsOpen,
    userDetails,
    districts,
    units,
    resetFilters,
    handleVoiceFilters,
    isLoggedIn,
    onLogout
  }), [filters, searchTerm, activeRole, isDarkMode, toggleDarkMode, alertsOpen, userDetails, isLoggedIn, onLogout, resetFilters]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
