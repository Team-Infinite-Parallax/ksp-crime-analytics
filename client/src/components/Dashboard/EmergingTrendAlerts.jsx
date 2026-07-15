import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, BarChart3, Clock } from 'lucide-react';
import { crimeIncidents } from '../../data/mockCrimeData';
import { useFilters } from '../../contexts/FilterContext';

const DISTRICTS = ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dakshina Kannada', 'Kalaburagi'];

export default function EmergingTrendAlerts() {
  const { activeRole } = useFilters();
  const [selectedDistrict, setSelectedDistrict] = React.useState('all');
  const [timeRange, setTimeRange] = React.useState('3months');

  const dates = useMemo(() => {
    const now = new Date('2026-07-12');
    const ranges = { '1month': 30, '3months': 90, '6months': 180 };
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (ranges[timeRange] || 90));
    return { now, cutoff };
  }, [timeRange]);

  const categoryStats = useMemo(() => {
    const stats = {};
    const sourceCrimes = crimeIncidents;

    sourceCrimes.forEach(c => {
      if (activeRole === 'DISTRICT_OFFICER' && c.districtId !== 1) return;
      if (activeRole === 'INVESTIGATION_OFFICER' && c.unitId !== 1) return;
      if (selectedDistrict !== 'all' && c.districtName !== selectedDistrict) return;

      const cat = c.crimeHeadName || 'Other';
      if (!stats[cat]) stats[cat] = { current: 0, historical: 0, historicalTotal: 0, historicalCount: 0 };
      const d = new Date(c.registrationDate);
      if (d >= dates.cutoff) {
        stats[cat].current++;
      } else {
        stats[cat].historical++;
      }
      stats[cat].historicalTotal += d >= dates.cutoff ? 0 : 1;
      stats[cat].historicalCount++;
    });

    const months = timeRange === '1month' ? 1 : timeRange === '3months' ? 3 : 6;
    return Object.entries(stats).map(([category, s]) => {
      const historicalAvg = s.historical > 0 ? s.historical / months : 1;
      const spikeRatio = historicalAvg > 0 ? s.current / historicalAvg : 1;
      return {
        category,
        currentMonth: s.current,
        historicalAvg: Math.round(historicalAvg),
        spikeRatio: parseFloat(spikeRatio.toFixed(2)),
        trend: spikeRatio > 1.3 ? 'spiking' : spikeRatio < 0.7 ? 'declining' : 'stable',
        anomalyThreshold: 1.3,
      };
    }).sort((a, b) => b.spikeRatio - a.spikeRatio);
  }, [activeRole, selectedDistrict, timeRange, dates]);

  const maxSpike = Math.max(...categoryStats.map(c => c.spikeRatio), 1);

  return (
    <div className="card-dark p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#cc3333]/8 via-[#cc3333]/3 to-transparent backdrop-blur-sm pointer-events-none" />
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Emerging Crime Trend Alerts</h3>
          <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
            Category-Level Spike Detection vs. Historical Baselines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 px-2 focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[9px] rounded-sm py-1.5 px-2 focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="1month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {categoryStats.map(c => {
          const isSpiking = c.trend === 'spiking';
          const spikeBarWidth = Math.min((c.spikeRatio / maxSpike) * 100, 100);
          const baselineBarWidth = Math.min((c.historicalAvg / maxSpike) * 100, 100);

          return (
            <div
              key={c.category}
              className={`p-3 rounded-sm border transition-all ${
                isSpiking
                  ? 'bg-[#8b0000]/10 border-[#cc3333]/30 animate-[pulse_2s_ease-in-out_infinite]'
                  : 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {isSpiking ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cc3333] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#cc3333]" />
                    </span>
                  ) : (
                    <Activity className="h-3 w-3 text-[var(--color-muted)]" />
                  )}
                  <span className="text-xs font-bold text-[var(--color-on-dark)]">{c.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isSpiking && (
                    <span className="text-[8px] bg-[#8b0000]/20 text-[#cc3333] border border-[#cc3333]/30 px-1.5 py-0.5 rounded-sm font-bold flex items-center">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                      ALERT
                    </span>
                  )}
                  <span className={`text-[9px] font-bold flex items-center ${
                    isSpiking ? 'text-[#cc3333]' : c.trend === 'declining' ? 'text-[#2e7d32]' : 'text-[var(--color-primary)]'
                  }`}>
                    {isSpiking ? <TrendingUp className="h-3 w-3 mr-1" /> : c.trend === 'declining' ? <TrendingDown className="h-3 w-3 mr-1" /> : <BarChart3 className="h-3 w-3 mr-1" />}
                    {isSpiking ? `+${((c.spikeRatio - 1) * 100).toFixed(0)}%` : c.trend === 'declining' ? `${((1 - c.spikeRatio) * 100).toFixed(0)}%` : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="flex items-center justify-between text-[8px] mb-0.5">
                    <span className="text-[#cc3333] font-bold">Current Period (Avg)</span>
                    <span className="font-plex font-bold text-[var(--color-on-dark)]">{c.currentMonth} cases</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${spikeBarWidth}%`,
                        background: isSpiking
                          ? 'linear-gradient(90deg, #cc3333, #ff4444)'
                          : 'linear-gradient(90deg, var(--color-primary), #818cf8)',
                        boxShadow: isSpiking ? '0 0 8px rgba(204, 51, 51, 0.6)' : 'none',
                      }}
                    />
                    {isSpiking && (
                      <div className="absolute inset-0 rounded-full bg-[#cc3333]/20 animate-pulse" style={{ width: `${spikeBarWidth}%` }} />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[8px] mb-0.5">
                    <span className="text-[var(--color-muted)] font-bold">Historical Baseline</span>
                    <span className="font-plex text-[var(--color-muted)]">{c.historicalAvg} cases/month avg</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-muted)]/40 transition-all" style={{ width: `${baselineBarWidth}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] text-[var(--color-muted)] pt-1">
                  <span className="flex items-center">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    Spike Ratio: {c.spikeRatio}x vs baseline
                  </span>
                  <span className="font-bold">Threshold: {c.anomalyThreshold}x</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {categoryStats.filter(c => c.trend === 'spiking').length > 0 && (
        <div className="mt-4 p-3 bg-[#8b0000]/15 border border-[#cc3333]/30 rounded-sm">
          <p className="text-[9px] text-[#cc3333] flex items-start">
            <AlertTriangle className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
            <span>
              <span className="font-bold">{categoryStats.filter(c => c.trend === 'spiking').length} categories spiking</span> above historical baselines.
              {selectedDistrict !== 'all' ? ` ${selectedDistrict} shows elevated activity.` : ''} Deploy proactive patrol resources to affected jurisdictions.
            </span>
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
