import React, { useState, useMemo } from 'react';
import { UserX, Map, AlertTriangle, TrendingUp, Fingerprint, Skull, ChevronRight, Search } from 'lucide-react';

const RISK_COLORS = {
  high: { text: 'text-[#cc3333]', bg: 'bg-[#8b0000]/10', border: 'border-[#8b0000]/30', bar: 'bg-[#cc3333]', label: 'Critical' },
  medium: { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', border: 'border-[var(--color-primary)]/20', bar: 'bg-[var(--color-primary)]', label: 'Elevated' },
  low: { text: 'text-[#2e7d32]', bg: 'bg-[#2e7d32]/10', border: 'border-[#2e7d32]/30', bar: 'bg-[#2e7d32]', label: 'Monitor' }
};

const CATEGORY_MO_MAP = {
  'Property Offences': ['Burglary by Night', 'Vehicle Theft', 'Theft (Other)'],
  'Cyber Crimes': ['Online Financial Fraud', 'Online Obscenity'],
  'Crimes Against Body': ['Murder for Gain'],
  'Narcotics NDPS': ['Cannabis/Ganja Possession']
};

const DISTRICTS = ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dakshina Kannada', 'Kalaburagi'];

export default function RiskProfiling({ offenders, crimes, activeRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffender, setSelectedOffender] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const riskDistribution = useMemo(() => {
    const high = offenders.filter(o => o.riskScore >= 80).length;
    const medium = offenders.filter(o => o.riskScore >= 50 && o.riskScore < 80).length;
    const low = offenders.filter(o => o.riskScore < 50).length;
    return { high, medium, low, total: offenders.length };
  }, [offenders]);

  const topOffenders = useMemo(() => {
    const sorted = [...offenders].sort((a, b) => b.riskScore - a.riskScore);
    return sorted.slice(0, 20);
  }, [offenders]);

  const moPatterns = useMemo(() => {
    const patternCounts = {};
    offenders.forEach(o => {
      const words = o.moPhrase.toLowerCase().split(/\s+/);
      const bigrams = [];
      for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(words[i] + ' ' + words[i + 1]);
      }
      bigrams.forEach(ngram => {
        if (['posed as', 'gained entry', 'created fake', 'waylaid victim', 'pushed parked'].includes(ngram)) {
          patternCounts[ngram] = (patternCounts[ngram] || 0) + 1;
        }
      });
    });
    return Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count, offenders: offenders.filter(o => o.moPhrase.toLowerCase().includes(pattern)) }))
      .sort((a, b) => b.count - a.count);
  }, [offenders]);

  const districtHeat = useMemo(() => {
    const heat = {};
    offenders.forEach(o => {
      const d = DISTRICTS[o.districtId - 1] || 'Unknown';
      heat[d] = (heat[d] || 0) + o.caseCount;
    });
    return Object.entries(heat).sort((a, b) => b[1] - a[1]);
  }, [offenders]);

  const alertOffenders = useMemo(() => {
    return offenders.filter(o => o.riskScore >= 80 || o.caseCount >= 8);
  }, [offenders]);

  const filteredOffenders = useMemo(() => {
    return topOffenders.filter(o => {
      if (selectedLevel !== 'all') {
        if (selectedLevel === 'high' && o.riskScore < 80) return false;
        if (selectedLevel === 'medium' && (o.riskScore < 50 || o.riskScore >= 80)) return false;
        if (selectedLevel === 'low' && o.riskScore >= 50) return false;
      }
      if (searchQuery && !o.name.toLowerCase().includes(searchQuery.toLowerCase()) && !o.moPhrase.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [topOffenders, selectedLevel, searchQuery]);

  const getRiskLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const maxCases = Math.max(...districtHeat.map(d => d[1]), 1);

  return (
    <div className="p-8 space-y-6">
      <div className="bg-[var(--color-surface-card-dark)] border border-[var(--color-primary)]/15 rounded-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <UserX className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-on-dark)]">Risk Profiling & Pattern Analysis</h2>
              <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
                Intelligence-led Predictive Threat Assessment
              </p>
            </div>
          </div>
          <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
            {offenders.length} Profiles Tracked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Total Tracked</span>
            <Fingerprint className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-on-dark)] mt-2">{riskDistribution.total}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Active profiles in system</span>
        </div>
        <div className="card-dark p-4 rounded-sm border border-[#8b0000]/20 bg-[var(--color-surface-card-dark)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Critical Risk</span>
            <Skull className="h-4 w-4 text-[#cc3333]" />
          </div>
          <p className="text-2xl font-black text-[#cc3333] mt-2">{riskDistribution.high}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Score ≥ 80 — Immediate action</span>
        </div>
        <div className="card-dark p-4 rounded-sm border border-[var(--color-primary)]/20 bg-[var(--color-surface-card-dark)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Elevated Risk</span>
            <AlertTriangle className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-black text-[var(--color-primary)] mt-2">{riskDistribution.medium}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Score 50–79 — Needs monitoring</span>
        </div>
        <div className="card-dark p-4 rounded-sm border border-[#2e7d32]/20 bg-[var(--color-surface-card-dark)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Low Risk</span>
            <TrendingUp className="h-4 w-4 text-[#2e7d32]" />
          </div>
          <p className="text-2xl font-black text-[#2e7d32] mt-2">{riskDistribution.low}</p>
          <span className="text-[9px] text-[var(--color-muted)]">Score &lt; 50 — Routine patrol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-dark p-5">
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            Risk Score Distribution
          </h3>
          <div className="space-y-3">
            {[
              { level: 'Critical (80-100)', count: riskDistribution.high, color: RISK_COLORS.high, pct: riskDistribution.total ? (riskDistribution.high / riskDistribution.total) * 100 : 0 },
              { level: 'Elevated (50-79)', count: riskDistribution.medium, color: RISK_COLORS.medium, pct: riskDistribution.total ? (riskDistribution.medium / riskDistribution.total) * 100 : 0 },
              { level: 'Monitor (0-49)', count: riskDistribution.low, color: RISK_COLORS.low, pct: riskDistribution.total ? (riskDistribution.low / riskDistribution.total) * 100 : 0 }
            ].map(item => (
              <div key={item.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[var(--color-muted)]">{item.level}</span>
                  <span className={`text-[10px] font-black ${item.color.text}`}>{item.count} offenders</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-dark)] rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color.bar} transition-all duration-500`} style={{ width: `${Math.max(item.pct, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dark p-5">
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-4 flex items-center">
            <Map className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            District Case Footprint
          </h3>
          <div className="space-y-2.5">
            {districtHeat.map(([district, cases]) => (
              <div key={district}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-[var(--color-muted)]">{district}</span>
                  <span className="text-[9px] font-bold text-[var(--color-muted)]">{cases} cases</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-dark)] rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${(cases / maxCases) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {alertOffenders.length > 0 && (
        <div className="card-dark p-5 rounded-sm border border-[#8b0000]/20 bg-[var(--color-surface-card-dark)]/80">
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 text-[#cc3333] mr-2" />
            Immediate Attention Required
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertOffenders.map(o => {
              const level = getRiskLevel(o.riskScore);
              const theme = RISK_COLORS[level];
              return (
                <div
                  key={o.id}
                  className="p-3 rounded-sm bg-[var(--color-canvas-dark)] border border-[#8b0000]/20 hover:border-[#cc3333]/40 transition-all cursor-pointer"
                  onClick={() => setSelectedOffender(selectedOffender?.id === o.id ? null : o)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--color-on-dark)]">{o.name}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} ${theme.border}`}>
                      {o.riskScore}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2 text-[9px] text-[var(--color-muted)]">
                    <span>{o.age}yrs / {o.gender}</span>
                    <span>{o.caseCount} cases</span>
                    <span>{o.distinctDistricts} districts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {moPatterns.length > 0 && (
          <div className="card-dark p-5">
            <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-3 flex items-center">
              <Fingerprint className="h-4 w-4 text-[var(--color-primary)] mr-2" />
              Pattern Matching Insights
            </h3>
            <div className="space-y-2">
              {moPatterns.map(({ pattern, count, offenders: patOffenders }) => (
                <div key={pattern} className="p-2.5 rounded-sm bg-[var(--color-canvas-dark)] border border-[var(--color-primary)]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[var(--color-primary)] uppercase tracking-wider">&ldquo;{pattern}&rdquo;</span>
                    <span className="text-[8px] font-black text-[var(--color-muted)] bg-slate-800 px-1.5 py-0.5 rounded">{count}x</span>
                  </div>
                  <p className="text-[9px] text-[var(--color-muted)] mt-1">
                    {patOffenders.map(o => o.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[var(--color-on-dark)] flex items-center">
              <UserX className="h-4 w-4 text-[var(--color-primary)] mr-2" />
              Offender Watchlist
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[var(--color-muted)]">
                  <Search className="h-3 w-3" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 pl-6 pr-2 focus:outline-none focus:border-[var(--color-primary)] placeholder-slate-500"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 px-2 focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="all">All Levels</option>
                <option value="high">Critical</option>
                <option value="medium">Elevated</option>
                <option value="low">Monitor</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredOffenders.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-muted)] text-[10px]">No offenders match current filters.</div>
            ) : (
              filteredOffenders.map(o => {
                const level = getRiskLevel(o.riskScore);
                const theme = RISK_COLORS[level];
                const isSelected = selectedOffender?.id === o.id;
                return (
                  <div
                    key={o.id}
                    className={`p-3 rounded-sm border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-surface-card-dark)] border-[var(--color-primary)]/40'
                        : 'bg-[var(--color-canvas-dark)] border-[var(--color-hairline-dark)] hover:border-[var(--color-primary)]/20'
                    }`}
                    onClick={() => setSelectedOffender(isSelected ? null : o)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${theme.bar} shrink-0`} />
                        <span className="text-xs font-bold text-[var(--color-on-dark)] truncate">{o.name}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} shrink-0`}>
                          {o.riskScore}
                        </span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 text-[var(--color-muted)] transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-primary)]/10 space-y-2 text-[10px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[var(--color-muted)] block">Age / Gender</span>
                            <span className="text-[var(--color-on-dark)] font-medium">{o.age} yrs / {o.gender}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-muted)] block">Total Cases</span>
                            <span className="text-[var(--color-on-dark)] font-medium">{o.caseCount}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-muted)] block">District Footprint</span>
                            <span className="text-[var(--color-on-dark)] font-medium">{o.distinctDistricts} districts</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-muted)] block">Risk Level</span>
                            <span className={`font-bold ${theme.text}`}>{theme.label}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[var(--color-muted)] block">Modus Operandi</span>
                          <span className="text-[var(--color-muted)] italic">&ldquo;{o.moPhrase}&rdquo;</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
