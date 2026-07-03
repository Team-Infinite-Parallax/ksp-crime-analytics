import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  LogIn,
  CheckCircle2
} from 'lucide-react';

const emblemSvgLarge = (
  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-blue-400 filter drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
    <circle cx="12" cy="12" r="10" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
    <circle cx="12" cy="12" r="7" stroke="rgba(212, 168, 83, 0.5)" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" />
    <path d="M12 1v22M1 12h22" strokeWidth="0.8" opacity="0.3" strokeDasharray="1 1" />
    <path d="M12 5a7 7 0 0 0-7 7" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 19a7 7 0 0 0 7-7" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 6l12 12M18 6l-12 12" strokeWidth="0.8" opacity="0.3" />
  </svg>
);

const usersList = [
  {
    role: 'SCRB_ADMIN',
    label: 'SCRB Admin (State HQ)',
    name: 'Prashant Kumar',
    designation: 'Director General, SCRB',
    email: 'prashant.kumar@ksp.gov.in',
    badgeId: 'KSP-SCRB-100',
    passcode: '100',
    description: 'Statewide intelligence, trends, and risk settings access.'
  },
  {
    role: 'DISTRICT_OFFICER',
    label: 'District Officer',
    name: 'Praveen Verma',
    designation: 'Superintendent of Police',
    email: 'praveen.verma@ksp.gov.in',
    badgeId: 'KSP-DIST-009',
    passcode: '009',
    description: 'Bengaluru Urban district crime trends and stations surveillance.'
  },
  {
    role: 'INVESTIGATION_OFFICER',
    label: 'Investigating Officer',
    name: 'Mohammed Puttaiah',
    designation: 'Sub-Inspector',
    email: 'mohammed.puttaiah@ksp.gov.in',
    badgeId: 'KSP-UNIT-001',
    passcode: '001',
    description: 'Station level case log, suspect tracking and workflow updates.'
  }
];

export default function Login({ onLogin }) {
  const [badgeId, setBadgeId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  const handleProfileSelect = (profile) => {
    setActiveProfile(profile.role);
    setBadgeId(profile.badgeId);
    setPasscode(profile.passcode);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        onLogin(profile.role);
        setLoading(false);
      }, 1000);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!badgeId.trim()) {
      setError('Please enter a valid Badge ID / Email.');
      return;
    }
    if (!passcode.trim()) {
      setError('Please enter your security passcode.');
      return;
    }

    setLoading(true);
    setError(null);

    // Validate credentials against our mock list
    setTimeout(() => {
      const foundUser = usersList.find(
        u => u.badgeId.toLowerCase() === badgeId.trim().toLowerCase() ||
             u.email.toLowerCase() === badgeId.trim().toLowerCase()
      );

      if (foundUser && foundUser.passcode === passcode.trim()) {
        setSuccess(true);
        setTimeout(() => {
          onLogin(foundUser.role);
          setLoading(false);
        }, 1000);
      } else {
        setError('Access Denied. Invalid Credentials or Security Code.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-canvas-dark)] flex flex-col items-center justify-center p-4 lg:p-6 text-[var(--color-on-dark)] relative overflow-hidden font-sans">
      {/* Decorative scanline or grid patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-surface-card-dark),var(--color-canvas-dark))]" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent animate-pulse" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch max-h-full">
        
        {/* Left Side: Info Briefing Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-[#0a192f] border border-blue-900/30 rounded-2xl shadow-2xl text-[var(--color-on-dark)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-blue-950/80 rounded-2xl border border-slate-700/60 shadow-lg">
                {emblemSvgLarge}
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Government of Karnataka</p>
                <h1 className="text-xl font-black text-slate-50 tracking-wider">KSP - CIP</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Crime Intelligence Portal</p>
              </div>
            </div>

            <div className="border-t border-[var(--color-hairline-dark)] pt-4 space-y-3">
              <h2 className="text-xs font-bold text-[var(--color-on-dark)] uppercase tracking-widest flex items-center">
                <Shield className="h-4 w-4 mr-2 text-[var(--color-primary)]" />
                Authorized Access Protocol
              </h2>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed font-medium">
                Welcome to the Karnataka State Police Crime Intelligence Portal. Access to this system is restricted to designated personnel under strict security clearance guidelines. All active sessions, searches, and analysis actions are audit-logged.
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--color-hairline-dark)] pt-4">
            <div className="bg-[#cc3333]/10 border border-[#cc3333]/30 rounded-2xl p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-[#cc3333] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-extrabold text-[#cc3333] uppercase tracking-wider">Security Warning</p>
                <p className="text-slate-400 mt-1 font-medium">
                  Unauthorized entry, attempt, or sharing of intelligence from this database constitutes a federal offense and is punishable under Section 66 of the IT Act & IPC laws.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Credentials & Quick Login Selectors */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          
          {/* Main Credentials Panel */}
          <div className="p-6 bg-[#0a192f] border border-blue-900/30 rounded-2xl shadow-2xl text-[var(--color-on-dark)] relative">
            <div className="absolute top-0 right-0 p-3">
              <span className="text-[10px] bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                Classified
              </span>
            </div>

            <h3 className="text-md font-bold text-[var(--color-on-dark)] mb-4 flex items-center">
              <Lock className="h-4.5 w-4.5 text-[var(--color-primary)] mr-2" />
              Portal Authentication
            </h3>

            {error && (
              <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/50 text-red-200 text-xs rounded-xl flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 bg-green-950/40 border border-green-800/50 text-green-200 text-xs rounded-xl flex items-center space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 animate-bounce" />
                <span className="font-bold">Credential Authenticated. Granting secure access...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Badge ID / Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="Enter KSP-SCRB-100 or email..."
                    className="w-full bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[14px] rounded-sm py-3 pl-10 pr-4 focus:outline-none focus:border-[var(--color-primary)] transition-all font-medium"
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">Security Passcode</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode..."
                    className="w-full bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[14px] rounded-sm py-3 pl-10 pr-12 focus:outline-none focus:border-[var(--color-primary)] transition-all font-mono"
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-100"
                    disabled={loading || success}
                  >
                    {showPasscode ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full mt-6 btn-primary py-3.5 px-4 rounded-sm text-[14px] font-bold uppercase transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Access Portal</span>
                    <LogIn className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Profile Selectors Panel */}
          <div className="p-4 bg-[#0a192f] border border-blue-900/30 rounded-2xl shadow-2xl text-[var(--color-on-dark)] space-y-2">
            <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest text-center border-b border-[var(--color-hairline-dark)] pb-3">
              Quick Officer Access Profiles (Only for Demo)
            </p>
            <div className="space-y-2">
              {usersList.map((user) => {
                const isActive = activeProfile === user.role;
                return (
                  <button
                    key={user.role}
                    type="button"
                    onClick={() => handleProfileSelect(user)}
                    className={`w-full text-left px-4 py-2.5 rounded-sm border transition-all duration-200 flex items-center space-x-3 group ${
                      isActive 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'border-[var(--color-hairline-dark)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-elevated-dark)]'
                    }`}
                  >
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide shrink-0 ${
                      user.role === 'SCRB_ADMIN' 
                        ? 'bg-blue-950 text-blue-400 border border-blue-800/40' 
                        : user.role === 'DISTRICT_OFFICER'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    }`}>
                      {user.role === 'SCRB_ADMIN' ? 'State' : user.role === 'DISTRICT_OFFICER' ? 'District' : 'SI'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{user.name}</h4>
                        <span className="text-[8px] font-mono text-slate-500 font-bold group-hover:text-slate-400 transition-colors shrink-0 ml-2">
                          {user.badgeId}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{user.designation}</p>
                    </div>
                    {isActive && <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
