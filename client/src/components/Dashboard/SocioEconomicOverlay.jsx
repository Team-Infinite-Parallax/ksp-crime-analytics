import React, { useMemo } from 'react';
import { TrendingUp, MapPin, Users, DollarSign, GraduationCap } from 'lucide-react';
import { districtSocioEconomic } from '../../data/constants';
import { crimeIncidents } from '../../data/mockCrimeData';

const FACTOR_META = {
  povertyIndex: { label: 'Poverty Index', icon: DollarSign, unit: '%', color: '#cc3333' },
  populationDensity: { label: 'Population Density', icon: Users, unit: '/km²', color: '#ff9933' },
  urbanizationRate: { label: 'Urbanization Rate', icon: TrendingUp, unit: '%', color: '#3399ff' },
  unemploymentRate: { label: 'Unemployment Rate', icon: Users, unit: '%', color: '#8b0000' },
  literacyRate: { label: 'Literacy Rate', icon: GraduationCap, unit: '%', color: '#2e7d32' },
  perCapitaIncome: { label: 'Per Capita Income', icon: DollarSign, unit: '₹', color: '#9933cc' },
};

const FACTOR_ORDER = ['povertyIndex', 'populationDensity', 'urbanizationRate', 'unemploymentRate', 'literacyRate', 'perCapitaIncome'];

export default function SocioEconomicOverlay({ activeRole, filters = {} }) {
  const [selectedFactor, setSelectedFactor] = React.useState('povertyIndex');

  const districtCrimeCounts = useMemo(() => {
    const counts = {};
    crimeIncidents.forEach(c => {
      if (activeRole === 'DISTRICT_OFFICER' && c.districtId !== 1) return;
      if (activeRole === 'INVESTIGATION_OFFICER' && c.unitId !== 1) return;
      if (filters.districtId !== 'all' && c.districtId !== Number(filters.districtId)) return;
      counts[c.districtId] = (counts[c.districtId] || 0) + 1;
    });
    return counts;
  }, [activeRole, filters]);

  const correlations = useMemo(() => {
    return districtSocioEconomic.map(d => ({
      ...d,
      crimeCount: districtCrimeCounts[d.districtId] || 0,
      factorValue: d[selectedFactor],
    }));
  }, [selectedFactor, districtCrimeCounts]);

  const maxFactor = Math.max(...correlations.map(c => c.factorValue), 1);
  const maxCrime = Math.max(...correlations.map(c => c.crimeCount), 1);

  const selectedMeta = FACTOR_META[selectedFactor];

  return (
    <div className="card-dark p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Socio-Economic Crime Correlation</h3>
          <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
            Understanding the &ldquo;Why&rdquo; Behind the &ldquo;Where&rdquo;
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5 shrink-0">
        {FACTOR_ORDER.map(key => {
          const meta = FACTOR_META[key];
          const Icon = meta.icon;
          const isActive = selectedFactor === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedFactor(key)}
              className={`flex items-center space-x-1.5 text-[9px] font-bold px-2.5 py-1.5 rounded-sm border transition-all ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40'
                  : 'bg-[var(--color-canvas-dark)] text-[var(--color-muted)] border-[var(--color-hairline-dark)] hover:border-[var(--color-primary)]/20'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
        {correlations.sort((a, b) => b.factorValue - a.factorValue).map(d => {
          const factorPct = (d.factorValue / maxFactor) * 100;
          const crimePct = (d.crimeCount / maxCrime) * 100;
          const correlationDelta = Math.abs(factorPct - crimePct);
          const isCorrelated = correlationDelta < 20;

          return (
            <div key={d.districtId} className="p-3 rounded-sm bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--color-on-dark)]">{d.name}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${
                  isCorrelated ? 'bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/20' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                }`}>
                  {isCorrelated ? 'Strong Correlation' : 'Weak Correlation'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span style={{ color: selectedMeta.color }} className="font-bold">{selectedMeta.label}</span>
                    <span className="font-plex font-bold text-[var(--color-on-dark)]">
                      {selectedFactor === 'perCapitaIncome' ? `${selectedMeta.unit}${d.factorValue.toLocaleString()}` : `${d.factorValue}${selectedMeta.unit}`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${factorPct}%`, backgroundColor: selectedMeta.color }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-[#cc3333] font-bold">Crime Incidents</span>
                    <span className="font-plex font-bold text-[var(--color-on-dark)]">{d.crimeCount} cases</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#cc3333] transition-all" style={{ width: `${crimePct}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--color-hairline-dark)] grid grid-cols-3 gap-2 text-[8px] text-[var(--color-muted)]">
                <span>Literacy: {d.literacyRate}%</span>
                <span>Urban: {d.urbanizationRate}%</span>
                <span>Income: ₹{d.perCapitaIncome.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-sm shrink-0">
        <p className="text-[9px] text-[var(--color-muted)]">
          <span className="font-bold">Insight:</span> Districts with higher {selectedMeta.label.toLowerCase()} show{' '}
          {correlations.some(d => {
            const fPct = (d.factorValue / maxFactor) * 100;
            const cPct = (d.crimeCount / maxCrime) * 100;
            return Math.abs(fPct - cPct) < 20;
          }) ? 'significant correlation' : 'divergent patterns'} with crime incidence rates.
          Toggle between factors to explore the socio-economic drivers behind crime distribution.
        </p>
      </div>
    </div>
  );
}
