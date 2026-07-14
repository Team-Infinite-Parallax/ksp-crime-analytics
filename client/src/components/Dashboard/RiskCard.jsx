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
    <div className={`card-dark flex flex-col justify-between h-full min-h-[240px] sm:min-h-[280px] p-4 sm:p-6 hover:-translate-y-1 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 group cursor-default relative overflow-hidden`}>

      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface-elevated-dark)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
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
            <span className={`text-[12px] font-bold px-3 py-1 rounded-[4px] border ${scoreTheme.bg} ${scoreTheme.text} border-current/20 shadow-inner`}>
              Risk: {offender.riskScore}
            </span>
          </div>
        </div>

        <div className="w-full bg-[var(--color-surface-elevated-dark)] rounded-full h-1.5 mt-4 overflow-hidden border border-[var(--color-hairline-dark)]">
          <div className={`h-full rounded-full ${scoreTheme.bar} shadow-[0_0_8px_currentColor]`} style={{ width: `${offender.riskScore}%` }} />
        </div>

        <div className="mt-5 p-3.5 bg-[var(--color-surface-elevated-dark)] rounded-md border border-[var(--color-hairline-dark)] max-h-[68px] overflow-hidden group-hover:border-[var(--color-muted)] transition-colors">
          <p className="text-[13px] text-[var(--color-body)] leading-relaxed italic line-clamp-2">
            &ldquo;{offender.moPhrase || 'Operates via coordinated vehicle compartments'}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-hairline-dark)] pt-4 mt-4 relative z-10">
        <div className="flex space-x-6">
          <div className="text-[12px]">
            <span className="text-[var(--color-muted)] block uppercase tracking-wider text-[10px] font-bold">Total Crimes</span>
            <span className="text-[16px] font-plex text-[var(--color-on-dark)] mt-0.5 block">{offender.caseCount}</span>
          </div>
          <div className="text-[12px]">
            <span className="text-[var(--color-muted)] block uppercase tracking-wider text-[10px] font-bold">Footprint</span>
            <span className="text-[16px] font-plex text-[var(--color-on-dark)] mt-0.5 block flex items-center">
              <Map className="h-4 w-4 mr-1 text-[var(--color-muted)]" />
              {offender.distinctDistricts} Dist
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewNetwork(offender)}
          aria-label={`View network for ${offender.name}`}
          className="p-2 bg-[var(--color-surface-elevated-dark)] text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] border border-[var(--color-hairline-dark)] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none group-hover:bg-[var(--color-canvas-dark)]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
