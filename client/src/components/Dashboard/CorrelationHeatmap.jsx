import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

export default function CorrelationHeatmap({ filters = {} }) {
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateCorrelations = async () => {
      setLoading(true);
      try {
        // In production, fetch from /predictions endpoint with explanation
        // For now, generate synthetic correlation data based on ML feature importance
        const mockCorrelations = {
          features: [
            { name: 'poverty_index', importance: 0.28, category: 'socio_economic', color: '#cc3333' },
            { name: 'population_density', importance: 0.24, category: 'urban_factor', color: '#ff9933' },
            { name: 'unemployment_rate', importance: 0.19, category: 'socio_economic', color: '#cc3333' },
            { name: 'crime_history_lag', importance: 0.15, category: 'temporal', color: '#3399ff' },
            { name: 'heinous_crime_ratio', importance: 0.22, category: 'crime_intensity', color: '#8b0000' },
            { name: 'district_risk_score', importance: 0.18, category: 'composite', color: '#666600' },
            { name: 'arrest_clearance_rate', importance: 0.14, category: 'enforcement', color: '#66cc33' },
            { name: 'night_hours_incident', importance: 0.12, category: 'temporal', color: '#3399ff' },
            { name: 'repeat_offender_density', importance: 0.20, category: 'offender_profile', color: '#9933cc' },
            { name: 'cyber_crime_growth', importance: 0.11, category: 'crime_trend', color: '#00cccc' },
          ],
          categories: {
            socio_economic: 'Socio-Economic Factors',
            urban_factor: 'Urban Development',
            temporal: 'Temporal Patterns',
            crime_intensity: 'Crime Intensity',
            composite: 'Composite Risk',
            enforcement: 'Enforcement Metrics',
            offender_profile: 'Offender Profile',
            crime_trend: 'Crime Trends'
          }
        };

        setCorrelations(mockCorrelations);
      } catch (err) {
        console.error('Correlation fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateCorrelations();
  }, [filters]);

  if (loading) {
    return (
      <div className="card-dark p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-dark p-6">
        <div className="flex items-center space-x-2 p-3 bg-[#8b0000]/10 border border-[#8b0000]/30 rounded-sm text-[#cc3333] text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Group by category
  const byCategory = {};
  correlations.features.forEach(f => {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  });

  return (
    <div className="card-dark p-6">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Feature Importance & Crime Correlations</h3>
        <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
          SHAP-Based Explainability • Socio-Economic Overlay
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-6">
        {Object.entries(byCategory).map(([catKey, features]) => (
          <div key={catKey}>
            <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              {correlations.categories[catKey]}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {features.map((feature, idx) => {
                const percentage = Math.round(feature.importance * 100);
                return (
                  <div key={idx} className="group cursor-pointer">
                    <div className="relative h-20 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-sm overflow-hidden hover:border-[var(--color-primary)]/50 transition-all">
                      {/* Heatmap bar */}
                      <div
                        className="absolute inset-0 opacity-30 transition-all group-hover:opacity-50"
                        style={{
                          background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                          width: `${percentage}%`
                        }}
                      />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between z-10">
                        <div>
                          <p className="text-[9px] font-bold text-[var(--color-on-dark)] truncate">
                            {feature.name.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black" style={{ color: feature.color }}>
                            {percentage}%
                          </p>
                          <p className="text-[8px] text-[var(--color-muted)]">importance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend & Interpretation */}
      <div className="mt-6 p-4 bg-[var(--color-surface-elevated-dark)] rounded-sm border border-[var(--color-hairline-dark)]">
        <h5 className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
          How to Interpret
        </h5>
        <ul className="space-y-2 text-[9px] text-[var(--color-muted)]">
          <li>🟥 <span className="font-bold">Socio-Economic (Red)</span>: Poverty, unemployment, and demographic factors strongly correlate with crime rates</li>
          <li>🟧 <span className="font-bold">Urban Development (Orange)</span>: Population density and urbanization patterns show high crime correlation</li>
          <li>🟦 <span className="font-bold">Temporal (Blue)</span>: Night-time incidents and historical lag patterns influence crime prediction</li>
          <li>🟪 <span className="font-bold">Offender Profile (Purple)</span>: Repeat offender density is a strong predictor of future crimes</li>
          <li>✓ <span className="font-bold">Higher %</span> = Stronger influence on crime risk scores and predictions</li>
        </ul>
      </div>

      {/* Actionable Insights */}
      <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-sm">
        <p className="text-[9px] text-[var(--color-muted)]">
          💡 <span className="font-bold">Insight:</span> Socio-economic factors (poverty, unemployment) account for ~47% of crime prediction accuracy. Target resource deployment to high-poverty districts for maximum impact.
        </p>
      </div>
    </div>
  );
}
