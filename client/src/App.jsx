import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import { FilterProvider, useFilters } from './contexts/FilterContext';
import MetricCard from './components/Dashboard/MetricCard';
import Filters from './components/Dashboard/Filters';
import CrimeTrendsChart from './components/Dashboard/CrimeTrendsChart';
import RiskCard from './components/Dashboard/RiskCard';
import RiskProfiling from './components/Dashboard/RiskProfiling';
import WantedMissing from './components/Dashboard/WantedMissing';
import ReportsAnalytics from './components/Dashboard/ReportsAnalytics';
import CopBot from './components/Dashboard/CopBot';
import RecentCrimesTable from './components/Dashboard/RecentCrimesTable';
import HotspotMap from './components/Dashboard/HotspotMap';
import NetworkGraph from './components/Dashboard/NetworkGraph';
import CaseOutcomePredictions from './components/Dashboard/CaseOutcomePredictions';
import TrendForecasts from './components/Dashboard/TrendForecasts';
import AlertBadge from './components/Dashboard/AlertBadge';
import AlertCenter from './components/Dashboard/AlertCenter';
import BehavioralProfiles from './components/Dashboard/BehavioralProfiles';
import CorrelationHeatmap from './components/Dashboard/CorrelationHeatmap';
import EmergingTrendAlerts from './components/Dashboard/EmergingTrendAlerts';
import SocioEconomicOverlay from './components/Dashboard/SocioEconomicOverlay';
import ResourceDeployment from './components/Dashboard/ResourceDeployment';
import {
  Shield,
  Users,
  AlertTriangle,
  FolderOpen,
  Activity,
  FileCheck,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { districts, units, getUserDetailsByRole, repeatOffenders, rawCrimesLog } from './data/constants';

const emblemSvg = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1" />
    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    <path d="M12 5a7 7 0 0 0-7 7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12 19a7 7 0 0 0 7-7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    {[0,1,2,3].map(i => {
      const angle = i * 22.5 * Math.PI / 180;
      const x1 = 12 + 3 * Math.sin(angle);
      const y1 = 12 - 3 * Math.cos(angle);
      const x2 = 12 + 6 * Math.sin(angle);
      const y2 = 12 - 6 * Math.cos(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" opacity="0.4" />;
    })}
  </svg>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mockRole, setMockRole] = useState('SCRB_ADMIN');

  if (!isLoggedIn) {
    return <Login onLogin={(role) => {
      setMockRole(role);
      setIsLoggedIn(true);
    }} />;
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <FilterProvider isLoggedIn={isLoggedIn} onLogout={handleLogout}>
      <AppWrapper activeTab={activeTab} setActiveTab={setActiveTab} mockRole={mockRole} />
    </FilterProvider>
  );
}

function AppWrapper({ activeTab, setActiveTab, mockRole }) {
  const { activeRole, setActiveRole } = useFilters();

  useEffect(() => {
    if (mockRole) {
      setActiveRole(mockRole);
    }
  }, [mockRole, setActiveRole]);

  return <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />;
}

function AppContent({ activeTab, setActiveTab }) {
  const {
    filters,
    searchTerm,
    activeRole,
    isDarkMode,
    alertsOpen,
    setAlertsOpen,
    userDetails,
    onLogout
  } = useFilters();

  /* Mobile sidebar drawer state */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = useCallback(() => setIsMobileSidebarOpen(prev => !prev), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

  const filteredCrimes = useMemo(() => {
    return rawCrimesLog.filter(c => {
      if (activeRole === 'DISTRICT_OFFICER' && c.districtId !== 1) return false;
      if (activeRole === 'INVESTIGATION_OFFICER' && c.unitId !== 1) return false;
      if (filters.districtId !== 'all' && Number(c.districtId) !== Number(filters.districtId)) return false;
      if (filters.unitId !== 'all' && Number(c.unitId) !== Number(filters.unitId)) return false;
      if (filters.gravity !== 'all' && c.gravity !== filters.gravity) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesCrimeNo = c.crimeNo.toLowerCase().includes(query);
        const matchesCategory = c.crimeHeadName.toLowerCase().includes(query);
        const matchesSubHead = c.crimeSubHeadName.toLowerCase().includes(query);
        const matchesStation = c.unitName.toLowerCase().includes(query);
        return matchesCrimeNo || matchesCategory || matchesSubHead || matchesStation;
      }
      return true;
    });
  }, [filters, activeRole, searchTerm]);

  const filteredOffenders = useMemo(() => {
    return repeatOffenders.filter(o => {
      if (activeRole === 'DISTRICT_OFFICER' && o.districtId !== 1) return false;
      if (activeRole === 'INVESTIGATION_OFFICER' && o.unitId !== 1) return false;
      if (filters.districtId !== 'all' && Number(o.districtId) !== Number(filters.districtId)) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return o.name.toLowerCase().includes(query) || o.moPhrase.toLowerCase().includes(query);
      }
      return true;
    });
  }, [filters, activeRole, searchTerm]);

  const metrics = useMemo(() => {
    const total = filteredCrimes.length;
    const resolved = filteredCrimes.filter(c => c.caseStatusName === 'Disposed').length;
    const active = total - resolved;
    const anomalies = filteredCrimes.filter(c => c.isAnomaly).length;
    return {
      total: total * 105,
      active: active * 65,
      resolved: resolved * 40,
      anomalies: anomalies * 4
    };
  }, [filteredCrimes]);

  const trendData = useMemo(() => {
    const scale = activeRole === 'INVESTIGATION_OFFICER' ? 1.5 : activeRole === 'DISTRICT_OFFICER' ? 8 : 45;
    return [
      { label: 'Jan', value: Math.round(110 * scale) },
      { label: 'Feb', value: Math.round(135 * scale) },
      { label: 'Mar', value: Math.round(125 * scale) },
      { label: 'Apr', value: Math.round(155 * scale) },
      { label: 'May', value: Math.round(145 * scale) },
      { label: 'Jun', value: Math.round(175 * scale) }
    ];
  }, [activeRole]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-canvas-dark)] text-[var(--color-body)] font-nova">
      {/* Skip Navigation Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-md font-bold shadow-lg"
      >
        Skip to main content
      </a>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} isMobileOpen={isMobileSidebarOpen} onMobileClose={closeMobileSidebar} />

      <main id="main-content" className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <Navbar onMenuToggle={toggleMobileSidebar} />

        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-[fadeIn_0.4s_ease-out_forwards]">
            
            {/* Structural Header */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 border-b border-[var(--color-hairline-dark)] pb-4">
                <span className="text-[10px] font-plex tracking-[0.2em] text-[var(--color-primary)] uppercase">
                  Section 01 //
                </span>
                <h2 className="text-[14px] font-bold tracking-widest text-[var(--color-muted)] uppercase">
                  Intelligence Feed
                </h2>
              </div>

              <div className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-2xl rounded-2xl gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="p-3 rounded-xl bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-primary)] shadow-inner shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      {emblemSvg}
                      <h3 className="text-[18px] sm:text-[22px] font-bold tracking-wide text-[var(--color-on-dark)]">Karnataka State Police</h3>
                    </div>
                    <p className="text-[14px] text-[var(--color-muted)] font-medium mt-1">
                      Authorised Personnel Only &bull; <span className="text-[var(--color-body)]">{userDetails.designation}</span> &bull; {userDetails.districtName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-2 sm:space-y-0 sm:space-y-2">
                  <span className="text-[11px] bg-[rgba(246,70,93,0.1)] text-[var(--color-trading-down)] border border-[rgba(246,70,93,0.2)] px-3 py-1.5 rounded-md font-bold uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-trading-down)] animate-pulse mr-2"></span>
                    Classified
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)] font-plex">
                    {new Date().toISOString().split('T')[0]} // SYS_ONLINE
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Case Ledger"
                value={metrics.total.toLocaleString()}
                trend="+12%"
                isPositive={true}
                icon={FolderOpen}
                sparklineData={[100, 110, 105, 120, 115, 130]}
                color="blue"
              />
              <MetricCard
                title="Active Investigations"
                value={metrics.active.toLocaleString()}
                trend="+8%"
                isPositive={true}
                icon={Activity}
                sparklineData={[80, 85, 95, 90, 100, 105]}
                color="amber"
              />
              <MetricCard
                title="Cases Disposed"
                value={metrics.resolved.toLocaleString()}
                trend="+16%"
                isPositive={true}
                icon={FileCheck}
                sparklineData={[30, 42, 48, 55, 60, 68]}
                color="green"
              />
              <MetricCard
                title="Statistical Anomalies"
                value={metrics.anomalies.toLocaleString()}
                trend="-4%"
                isPositive={false}
                icon={AlertTriangle}
                sparklineData={[8, 12, 10, 7, 9, 6]}
                color="red"
              />
            </div>

            <Filters />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CrimeTrendsChart title="Crime Volume Registrations (Year-on-Year)" data={trendData} showAnomalies={true} />
              </div>
              <div className="card-dark p-4 sm:p-6 h-full min-h-[280px] sm:min-h-[340px] flex flex-col justify-between">
                <div>
                  <h3 className="text-[16px] sm:text-[20px] font-semibold text-[var(--color-on-dark)]">Jurisdictional Status</h3>
                  <p className="text-[12px] sm:text-[14px] text-[var(--color-muted)] font-medium mt-0.5">Active Station Performance</p>
                </div>
                <div className="space-y-4 my-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[var(--color-muted)]">Patrol Vehicles Active</span>
                    <span className="text-[16px] font-plex text-[var(--color-on-dark)]">14 / 16 (87.5%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[var(--color-muted)]">Response Efficiency</span>
                    <span className="text-[16px] font-plex text-[var(--color-info)]">11.4 mins average</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[var(--color-muted)]">Chargesheet Disposal Rate</span>
                    <span className="text-[16px] font-plex text-[var(--color-trading-up)]">76.3% Efficiency</span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-surface-elevated-dark)] rounded-xl flex items-center space-x-2.5">
                  <TrendingUp className="h-[18px] w-[18px] text-[var(--color-primary)]" />
                  <span className="text-[13px] text-[var(--color-muted)] leading-normal">
                    Operational stats correspond dynamically to your role's administrative level.
                  </span>
                </div>
              </div>
            </div>

            <EmergingTrendAlerts />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CaseOutcomePredictions />
              <TrendForecasts />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[18px] sm:text-[24px] font-semibold text-[var(--color-on-dark)]">Repeat Offender Profiles</h3>
                  <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">High-Risk Crime Syndicate Suspects</p>
                </div>
                <span className="hidden sm:flex items-center text-[14px] font-bold text-[var(--color-info)] bg-[var(--color-surface-card-dark)] px-4 py-2 rounded-lg">
                  <Fingerprint className="h-[18px] w-[18px] mr-2" />
                  Pattern Matching Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffenders.length === 0 ? (
                  <div className="col-span-full card-dark p-8 text-center text-[var(--color-muted)] font-medium">
                    No high-risk profiles found within this administrative jurisdiction.
                  </div>
                ) : (
                  filteredOffenders.map(offender => (
                    <RiskCard
                      key={offender.id}
                      offender={offender}
                      onViewNetwork={() => {
                        setActiveTab('network');
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SocioEconomicOverlay />
              <ResourceDeployment />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-full">
                <BehavioralProfiles />
              </div>
              <div className="h-full">
                <CorrelationHeatmap />
              </div>
            </div>

            <RecentCrimesTable crimes={filteredCrimes} />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative p-4 sm:p-6 lg:p-8 animate-[fadeIn_0.4s_ease-out_forwards]">
            <NetworkGraph />
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="flex-1 overflow-y-auto relative">
            <RiskProfiling
              offenders={filteredOffenders}
              crimes={filteredCrimes}
              activeRole={activeRole}
            />
          </div>
        )}

        {activeTab === 'wanted' && (
          <div className="flex-1 overflow-y-auto relative">
            <WantedMissing />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto relative">
            <ReportsAnalytics
              crimes={filteredCrimes}
              offenders={filteredOffenders}
              activeRole={activeRole}
            />
          </div>
        )}

        {activeTab !== 'dashboard' && activeTab !== 'hotspots' && activeTab !== 'network' && activeTab !== 'risk' && activeTab !== 'wanted' && activeTab !== 'reports' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
            <div className="p-3 sm:p-4 bg-[var(--color-surface-card-dark)] rounded-full text-[var(--color-primary)] mb-3 sm:mb-4">
              <Users className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 className="text-[18px] sm:text-[22px] lg:text-[24px] font-bold text-[var(--color-on-dark)] capitalize">{activeTab} Analytics Module</h2>
            <p className="text-[12px] sm:text-[14px] text-[var(--color-muted)] max-w-sm mt-1 px-4">
              This module is secure and active. Backend systems are protected under role-based policies requiring {activeRole}.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="btn-primary mt-4 sm:mt-6"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {activeTab === 'hotspots' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative p-4 sm:p-6 lg:p-8">
            <HotspotMap />
          </div>
        )}
      </main>

      {/* Alert Center Modal */}
      {alertsOpen && <AlertCenter isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />}

      <CopBot />
    </div>
  );
}
