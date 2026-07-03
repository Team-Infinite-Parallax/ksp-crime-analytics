import React from 'react';
import { Map, ChevronRight } from 'lucide-react';

export default function RiskCard({ offender, onViewNetwork }) {
  const getRiskScoreColor = (score) => {
    if (score >= 80) return { text: 'text-[var(--color-trading-down)]', bg: 'bg-[var(--color-trading-down)]/10', bar: 'bg-[var(--color-trading-down)]' };
    if (score >= 50) return { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', bar: 'bg-[var(--color-primary)]' };
    return { text: 'text-[var(--color-trading-up)]', bg: 'bg-[var(--color-trading-up)]/10', bar: 'bg-[var(--color-trading-up)]' };
  };

  const scoreTheme = getRiskScoreColor(offender.riskScore);

  return (
    <div className={`card-dark flex flex-col justify-between h-[240px] p-6 hover:bg-[var(--color-surface-elevated-dark)] transition-colors group`}>

      <div>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[16px] font-semibold text-[var(--color-on-dark)] group-hover:text-[var(--color-primary)] transition-colors">
              {offender.name}
            </h4>
            <span className="text-[12px] text-[var(--color-muted)] font-medium uppercase mt-0.5 block">
              {offender.gender} &bull; Age {offender.age}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className={`text-[12px] font-bold px-3 py-1 rounded-[4px] ${scoreTheme.bg} ${scoreTheme.text}`}>
              Risk: {offender.riskScore}
            </span>
          </div>
        </div>

        <div className="w-full bg-[var(--color-surface-elevated-dark)] rounded-full h-1 mt-4 overflow-hidden">
          <div className={`h-full rounded-full ${scoreTheme.bar}`} style={{ width: `${offender.riskScore}%` }} />
        </div>

        <div className="mt-4 p-3 rounded-sm border border-[var(--color-hairline-dark)] max-h-[64px] overflow-hidden">
          <p className="text-[14px] text-[var(--color-muted)] leading-normal italic line-clamp-2">
            &ldquo;{offender.moPhrase || 'Operates via coordinated vehicle compartments'}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-hairline-dark)] pt-4 mt-4">
        <div className="flex space-x-6">
          <div className="text-[12px]">
            <span className="text-[var(--color-muted)] block">Total Crimes</span>
            <span className="text-[16px] font-plex text-[var(--color-on-dark)] mt-0.5 block">{offender.caseCount} Cases</span>
          </div>
          <div className="text-[12px]">
            <span className="text-[var(--color-muted)] block">Footprint</span>
            <span className="text-[16px] font-plex text-[var(--color-on-dark)] mt-0.5 block flex items-center">
              <Map className="h-4 w-4 mr-1 text-[var(--color-muted)]" />
              {offender.distinctDistricts} Districts
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewNetwork(offender)}
          className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
