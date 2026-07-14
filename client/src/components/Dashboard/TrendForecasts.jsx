import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader, AlertCircle } from 'lucide-react';
import { MOCK_FORECASTS, fetchWithFallback } from '../../utils/mockApi';
import { useFilters } from '../../contexts/FilterContext';

export default function TrendForecasts() {
  const { filters } = useFilters();
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          type: 'trend',
          limit: 5
        });

        if (filters.districtId && filters.districtId !== 'all') {
          queryParams.append('districtId', filters.districtId);
        }

        const result = await fetchWithFallback(`/predictions?${queryParams}`);
        setForecasts(result?.forecasts || MOCK_FORECASTS);
      } catch (err) {
        console.error('Forecast fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, [filters]);

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'INCREASING': return <TrendingUp className="h-4 w-4 text-[#cc3333]" />;
      case 'DECREASING': return <TrendingDown className="h-4 w-4 text-[#2e7d32]" />;
      default: return <Minus className="h-4 w-4 text-[var(--color-primary)]" />;
    }
  };

  const getTrendColor = (direction) => {
    switch(direction) {
      case 'INCREASING': return 'bg-[#8b0000]/10 border-[#8b0000]/30';
      case 'DECREASING': return 'bg-[#2e7d32]/10 border-[#2e7d32]/30';
      default: return 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30';
    }
  };

  return (
    <div className="card-dark p-4 sm:p-6 h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-transparent backdrop-blur-sm pointer-events-none" />
      <div className="relative z-10 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-on-dark)]">12-Week Crime Forecasts</h3>
            <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
              Predictive Trend Analysis
            </p>
          </div>
        </div>
        <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {forecasts.length} Districts
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 flex-1">
          <Loader className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-[#8b0000]/10 border border-[#8b0000]/30 rounded-sm text-[#cc3333] text-sm shrink-0">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && forecasts.length > 0 && (
        <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
          {forecasts.map((forecast, idx) => {
            const fcast = forecast.forecast || [];
            const futureCases = fcast[fcast.length - 1]?.yhat ?? 0;
            const currentCases = forecast.currentAvg ?? 0;
            const percentChange = currentCases > 0 ? ((futureCases - currentCases) / currentCases * 100).toFixed(1) : 0;
            
            return (
              <div key={idx} className={`p-3 border rounded-sm ${getTrendColor(forecast.trendDirection)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-on-dark)]">{forecast.district}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Current avg: <span className="font-bold">{currentCases}</span> cases/week
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(forecast.trendDirection)}
                    <span className="text-xs font-bold uppercase">{forecast.trendDirection}</span>
                  </div>
                </div>

                {/* Mini forecast chart */}
                {fcast.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-end justify-between space-x-1 h-12">
                    {fcast.slice(0, 12).map((week, widx) => (
                      <div
                        key={widx}
                        className="flex-1 bg-[var(--color-primary)] rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        style={{
                          height: `${(week.yhat / Math.max(...fcast.map(w => w.yhat)) * 100).toFixed(0)}%`,
                          minHeight: '2px'
                        }}
                        title={`Week ${widx + 1}: ${week.yhat} cases`}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-[var(--color-muted)]">
                    Peak: {forecast.peakWeek} • Projected: <span className="font-bold text-[var(--color-on-dark)]">{futureCases}</span> cases ({percentChange > 0 ? '+' : ''}{percentChange}%)
                  </p>
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && forecasts.length === 0 && !error && (
        <p className="text-sm text-[var(--color-muted)] text-center py-6 flex-1 flex items-center justify-center">No forecast data available</p>
      )}
      </div>
    </div>
  );
}
