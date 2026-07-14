import React, { useMemo } from 'react';
import { Navigation, Shield, ShieldAlert, AlertTriangle, Plus, Minus } from 'lucide-react';
import { resourceDeployment } from '../../data/constants';

export default function ResourceDeployment({ activeRole, filters = {} }) {
  const filtered = useMemo(() => {
    return resourceDeployment.filter(r => {
      if (activeRole === 'DISTRICT_OFFICER' && r.districtId !== 1) return false;
      if (activeRole === 'INVESTIGATION_OFFICER' && r.unitId !== 1) return false;
      if (filters.districtId !== 'all' && r.districtId !== Number(filters.districtId)) return false;
      return true;
    });
  }, [activeRole, filters]);

  const totalGap = filtered.reduce((sum, r) => sum + Math.abs(Math.min(r.gap, 0)), 0);
  const criticalCount = filtered.filter(r => r.riskLevel === 'critical').length;
  const highCount = filtered.filter(r => r.riskLevel === 'high').length;

  return (
    <div className="card-dark p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Smart Resource Deployment</h3>
          <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
            AI-Recommended Patrol Allocation Based on Crime Hotspots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
        <div className="p-3 rounded-sm bg-[#8b0000]/10 border border-[#cc3333]/30 text-center">
          <span className="text-lg font-black text-[#cc3333] block">{totalGap}</span>
          <span className="text-[8px] text-[var(--color-muted)] font-bold uppercase tracking-wider">Patrol Deficit</span>
        </div>
        <div className="p-3 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-center">
          <span className="text-lg font-black text-[var(--color-primary)] block">{criticalCount + highCount}</span>
          <span className="text-[8px] text-[var(--color-muted)] font-bold uppercase tracking-wider">High Priority Units</span>
        </div>
        <div className="p-3 rounded-sm bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-center">
          <span className="text-lg font-black text-[#2e7d32] block">{filtered.filter(r => r.gap >= 0).length}</span>
          <span className="text-[8px] text-[var(--color-muted)] font-bold uppercase tracking-wider">Adequately Staffed</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto min-h-0 pr-1">
        {filtered.sort((a, b) => b.priorityScore - a.priorityScore).map(r => {
          const theme = r.riskLevel === 'critical'
            ? { bg: 'bg-[#8b0000]/10', border: 'border-[#cc3333]/30', text: 'text-[#cc3333]', bar: 'bg-[#cc3333]', label: 'Critical' }
            : r.riskLevel === 'high'
            ? { bg: 'bg-[var(--color-primary)]/10', border: 'border-[var(--color-primary)]/30', text: 'text-[var(--color-primary)]', bar: 'bg-[var(--color-primary)]', label: 'High' }
            : r.riskLevel === 'medium'
            ? { bg: 'bg-[#ff9933]/10', border: 'border-[#ff9933]/30', text: 'text-[#ff9933]', bar: 'bg-[#ff9933]', label: 'Medium' }
            : { bg: 'bg-[#2e7d32]/10', border: 'border-[#2e7d32]/30', text: 'text-[#2e7d32]', bar: 'bg-[#2e7d32]', label: 'Stable' };

          const utilizationPct = Math.min((r.currentPatrol / r.recommendedPatrol) * 100, 100);

          return (
            <div key={r.unitId} className={`p-3 rounded-sm border ${theme.bg} ${theme.border}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  {r.gap < 0 ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-[#cc3333]" />
                  ) : (
                    <Shield className="h-3.5 w-3.5 text-[#2e7d32]" />
                  )}
                  <span className="text-xs font-bold text-[var(--color-on-dark)]">{r.unitName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${theme.bg} ${theme.text}`}>
                    {theme.label}
                  </span>
                  <span className="text-[8px] font-plex text-[var(--color-muted)]">Score: {r.priorityScore}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5 text-[9px]">
                <div className="flex items-center space-x-3">
                  <span className="text-[var(--color-muted)]">
                    Patrol:{' '}
                    <span className="font-bold text-[var(--color-on-dark)]">{r.currentPatrol}</span>
                    {r.gap < 0 && (
                      <span className="text-[#cc3333] font-bold"> (-{Math.abs(r.gap)})</span>
                    )}
                  </span>
                  <span className="text-[var(--color-muted)]">
                    Recommended:{' '}
                    <span className="font-bold text-[var(--color-primary)]">{r.recommendedPatrol}</span>
                  </span>
                  <span className="text-[var(--color-muted)]">
                    Hotspots:{' '}
                    <span className="font-bold text-[var(--color-on-dark)]">{r.hotspotDensity}</span>
                  </span>
                </div>
                <span className="text-[var(--color-muted)]">{r.responseTime}m avg</span>
              </div>

              <div className="w-full h-2 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${utilizationPct}%`, background: utilizationPct < 60 ? 'linear-gradient(90deg, #cc3333, #ff4444)' : utilizationPct < 85 ? 'linear-gradient(90deg, var(--color-primary), #818cf8)' : 'linear-gradient(90deg, #2e7d32, #4caf50)' }} />
              </div>
              <div className="flex justify-between text-[7px] text-[var(--color-muted)] mt-0.5">
                <span>Under-utilized</span>
                <span>Optimal</span>
                <span>Over-utilized</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-sm shrink-0">
        <p className="text-[9px] text-[var(--color-muted)] flex items-start">
          <Navigation className="h-3 w-3 mr-1.5 mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <span>
            <span className="font-bold">Deploy {totalGap} additional patrol vehicles</span> to stations with negative gaps.
            Re-allocation from stable units ({filtered.filter(r => r.gap >= 0).length} stations) can cover{' '}
            {filtered.filter(r => r.gap >= 0).reduce((s, r) => s + Math.max(r.currentPatrol - r.recommendedPatrol, 0), 0)} surplus vehicles.
          </span>
        </p>
      </div>
    </div>
  );
}
