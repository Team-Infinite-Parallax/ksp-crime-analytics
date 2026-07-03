import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
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
import {
  FolderLock,
  Shield,
  MapPin,
  Users,
  AlertTriangle,
  FolderOpen,
  Activity,
  FileCheck,
  TrendingUp,
  Fingerprint
} from 'lucide-react';

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
  const [activeRole, setActiveRole] = useState('SCRB_ADMIN');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    districtId: 'all',
    unitId: 'all',
    dateRange: '30days',
    gravity: 'all'
  });

  const districts = [
    { id: 1, name: 'Bengaluru Urban' },
    { id: 2, name: 'Mysuru' },
    { id: 3, name: 'Belagavi' },
    { id: 4, name: 'Dakshina Kannada' },
    { id: 5, name: 'Kalaburagi' }
  ];

  const units = [
    { id: 1, districtId: 1, name: 'Shivajinagar PS' },
    { id: 2, districtId: 1, name: 'Indiranagar PS' },
    { id: 3, districtId: 1, name: 'Halasuru PS' },
    { id: 4, districtId: 2, name: 'Devaraja PS' },
    { id: 5, districtId: 2, name: 'Lakshmipuram PS' },
    { id: 6, districtId: 3, name: 'Belagavi Town PS' },
    { id: 7, districtId: 4, name: 'Mangaluru South PS' },
    { id: 8, districtId: 5, name: 'Kalaburagi City PS' }
  ];

  const userDetails = useMemo(() => {
    switch (activeRole) {
      case 'SCRB_ADMIN':
        return {
          employeeID: 100,
          firstName: 'Prashant',
          lastName: 'Kumar',
          email: 'prashant.kumar@ksp.gov.in',
          designation: 'Director General, SCRB',
          districtName: 'State Headquarters',
          unitName: 'SCRB HQ, Bengaluru'
        };
      case 'DISTRICT_OFFICER':
        return {
          employeeID: 9,
          firstName: 'Praveen',
          lastName: 'Verma',
          email: 'praveen.verma@ksp.gov.in',
          designation: 'Superintendent of Police',
          districtName: 'Bengaluru Urban',
          unitName: 'District Office'
        };
      case 'INVESTIGATION_OFFICER':
        return {
          employeeID: 1,
          firstName: 'Mohammed',
          lastName: 'Puttaiah',
          email: 'mohammed.puttaiah@ksp.gov.in',
          designation: 'Sub-Inspector',
          districtName: 'Bengaluru Urban',
          unitName: 'Shivajinagar PS'
        };
      default:
        return {};
    }
  }, [activeRole]);

  useEffect(() => {
    if (activeRole === 'DISTRICT_OFFICER') {
      setFilters(f => ({ ...f, districtId: '1', unitId: 'all' }));
    } else if (activeRole === 'INVESTIGATION_OFFICER') {
      setFilters(f => ({ ...f, districtId: '1', unitId: '1' }));
    } else {
      setFilters(f => ({ ...f, districtId: 'all', unitId: 'all' }));
    }
  }, [activeRole]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const repeatOffenders = [
    { id: 1, name: 'Rajesh Choudhary', age: 30, gender: 'Male', riskScore: 92, caseCount: 11, distinctDistricts: 3, moPhrase: 'posed as bank official via mobile phone and extracted OTP', districtId: 1, unitId: 1 },
    { id: 2, name: 'Imran Basappa', age: 29, gender: 'Male', riskScore: 84, caseCount: 8, distinctDistricts: 2, moPhrase: 'gained entry through rear window after removing iron grille', districtId: 1, unitId: 2 },
    { id: 3, name: 'Sneha Yellappa', age: 41, gender: 'Female', riskScore: 78, caseCount: 6, distinctDistricts: 2, moPhrase: 'created fake matrimonial profile online and defrauded multiple victims', districtId: 2, unitId: 4 },
    { id: 4, name: 'Vikas Gupta', age: 35, gender: 'Male', riskScore: 65, caseCount: 5, distinctDistricts: 1, moPhrase: 'waylaid victim near ATM and snatched gold chain and mobile phone', districtId: 3, unitId: 6 },
    { id: 5, name: 'Anil Deshpande', age: 38, gender: 'Male', riskScore: 49, caseCount: 4, distinctDistricts: 1, moPhrase: 'pushed parked motorcycle silently and departed using hotwire ignition technique', districtId: 4, unitId: 7 }
  ];

  const rawCrimesLog = [
    { id: 101, crimeNo: '10041202600001', registrationDate: '2026-07-01', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Burglary by Night', unitName: 'Shivajinagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 1, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: true },
    { id: 102, crimeNo: '10041202600002', registrationDate: '2026-06-29', crimeHeadName: 'Cyber Crimes', crimeSubHeadName: 'Online Financial Fraud', unitName: 'Indiranagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 2, caseStatusName: 'Chargesheeted', gravity: '2', isAnomaly: false },
    { id: 103, crimeNo: '10042202600003', registrationDate: '2026-06-28', crimeHeadName: 'Crimes Against Body', crimeSubHeadName: 'Murder for Gain', unitName: 'Shivajinagar PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 1, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: false },
    { id: 104, crimeNo: '10043202600004', registrationDate: '2026-06-25', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Vehicle Theft', unitName: 'Devaraja PS', districtName: 'Mysuru', districtId: 2, unitId: 4, caseStatusName: 'Disposed', gravity: '2', isAnomaly: false },
    { id: 105, crimeNo: '10044202600005', registrationDate: '2026-06-20', crimeHeadName: 'Narcotics NDPS', crimeSubHeadName: 'Cannabis/Ganja Possession', unitName: 'Mangaluru South PS', districtName: 'Dakshina Kannada', districtId: 4, unitId: 7, caseStatusName: 'Chargesheeted', gravity: '1', isAnomaly: true },
    { id: 106, crimeNo: '10045202600006', registrationDate: '2026-06-18', crimeHeadName: 'Cyber Crimes', crimeSubHeadName: 'Online Obscenity', unitName: 'Belagavi Town PS', districtName: 'Belagavi', districtId: 3, unitId: 6, caseStatusName: 'Under Investigation', gravity: '2', isAnomaly: false },
    { id: 107, crimeNo: '10046202600007', registrationDate: '2026-06-15', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Theft (Other)', unitName: 'Kalaburagi City PS', districtName: 'Kalaburagi', districtId: 5, unitId: 8, caseStatusName: 'Disposed', gravity: '2', isAnomaly: false },
    { id: 108, crimeNo: '10041202600008', registrationDate: '2026-06-12', crimeHeadName: 'Property Offences', crimeSubHeadName: 'Burglary by Night', unitName: 'Halasuru PS', districtName: 'Bengaluru Urban', districtId: 1, unitId: 3, caseStatusName: 'Under Investigation', gravity: '1', isAnomaly: false }
  ];

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
  }, [rawCrimesLog, filters, activeRole, searchTerm]);

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
  }, [repeatOffenders, filters, activeRole, searchTerm]);

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

  const handleResetFilters = () => {
    if (activeRole === 'SCRB_ADMIN') {
      setFilters({ districtId: 'all', unitId: 'all', dateRange: '30days', gravity: 'all' });
    } else if (activeRole === 'DISTRICT_OFFICER') {
      setFilters({ districtId: '1', unitId: 'all', dateRange: '30days', gravity: 'all' });
    } else {
      setFilters({ districtId: '1', unitId: '1', dateRange: '30days', gravity: 'all' });
    }
    setSearchTerm('');
  };

  const handleVoiceFilters = (voiceFilters, speechText) => {
    setFilters(prev => {
      const next = { ...prev };
      if (activeRole === 'SCRB_ADMIN') {
        if (voiceFilters.districtId !== 'all') next.districtId = voiceFilters.districtId;
        if (voiceFilters.unitId !== 'all') next.unitId = voiceFilters.unitId;
      } else if (activeRole === 'DISTRICT_OFFICER') {
        next.districtId = '1';
        if (voiceFilters.unitId !== 'all') {
          const matchedUnit = units.find(u => Number(u.id) === Number(voiceFilters.unitId));
          if (matchedUnit && Number(matchedUnit.districtId) === 1) {
            next.unitId = voiceFilters.unitId;
          }
        }
      } else if (activeRole === 'INVESTIGATION_OFFICER') {
        next.districtId = '1';
        next.unitId = '1';
      }
      if (voiceFilters.gravity) next.gravity = voiceFilters.gravity;
      if (voiceFilters.dateRange) next.dateRange = voiceFilters.dateRange;
      return next;
    });
    if (voiceFilters.searchTerm) {
      setSearchTerm(voiceFilters.searchTerm);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(role) => {
      setActiveRole(role);
      setIsLoggedIn(true);
    }} />;
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas-dark)] text-[var(--color-body)] font-nova">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userDetails={userDetails}
          onVoiceFilters={handleVoiceFilters}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="card-dark p-6 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {emblemSvg}
                    <h3 className="text-[20px] font-bold tracking-wide text-[var(--color-on-dark)]">Karnataka State Police — Intelligence Feed</h3>
                  </div>
                  <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">
                    Authorised Personnel Only &bull; {userDetails.designation} &bull; {userDetails.districtName}
                  </p>
                </div>
              </div>
              <span className="text-[12px] bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] px-3 py-1 rounded-[4px] font-bold uppercase tracking-wider">
                Classified
              </span>
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

            <Filters
              filters={filters}
              setFilters={setFilters}
              districts={districts}
              units={units}
              onReset={handleResetFilters}
              activeRole={activeRole}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CrimeTrendsChart title="Crime Volume Registrations (Year-on-Year)" data={trendData} />
              </div>
              <div className="card-dark p-6 h-[340px] flex flex-col justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold text-[var(--color-on-dark)]">Jurisdictional Status</h3>
                  <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">Active Station Performance</p>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[24px] font-semibold text-[var(--color-on-dark)]">Repeat Offender Profiles</h3>
                  <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">High-Risk Crime Syndicate Suspects</p>
                </div>
                <span className="flex items-center text-[14px] font-bold text-[var(--color-info)] bg-[var(--color-surface-card-dark)] px-4 py-2 rounded-lg">
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
                      onViewNetwork={(off) => {
                        setActiveTab('network');
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            <RecentCrimesTable crimes={filteredCrimes} />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
            <NetworkGraph activeRole={activeRole} />
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
            <WantedMissing activeRole={activeRole} />
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
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-[var(--color-surface-card-dark)] rounded-full text-[var(--color-primary)] mb-4">
              <Users className="h-10 w-10" />
            </div>
            <h2 className="text-[24px] font-bold text-[var(--color-on-dark)] capitalize">{activeTab} Analytics Module</h2>
            <p className="text-[14px] text-[var(--color-muted)] max-w-sm mt-1">
              This module is secure and active. Backend systems are protected under role-based policies requiring {activeRole}.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="btn-primary mt-6"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {activeTab === 'hotspots' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative p-4 sm:p-6 lg:p-8">
            <HotspotMap activeRole={activeRole} isDarkMode={isDarkMode} />
          </div>
        )}
      </main>
      <CopBot activeRole={activeRole} />
    </div>
  );
}
