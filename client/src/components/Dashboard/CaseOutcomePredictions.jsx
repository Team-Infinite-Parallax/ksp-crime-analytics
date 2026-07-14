import React, { useState, useEffect } from 'react';
import { FileCheck, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { MOCK_OUTCOMES, fetchWithFallback } from '../../utils/mockApi';

export default function CaseOutcomePredictions({ filters = {} }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          type: 'caseOutcome',
          limit: 10
        });

        if (filters.districtId && filters.districtId !== 'all') {
          queryParams.append('districtId', filters.districtId);
        }

        const response = await fetch(`/predictions?${queryParams}`, {
          headers: {
            'x-employee-role': localStorage.getItem('userRole') || 'SCRB_ADMIN',
            'x-employee-email': localStorage.getItem('userEmail') || 'test@ksp.in'
          }
        });

        const result = await fetchWithFallback(`/predictions?${queryParams}`);
        setPredictions(result?.caseOutcomes || MOCK_OUTCOMES);
      } catch (err) {
        console.error('Prediction fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [filters]);

  const getOutcomeColor = (outcome) => {
    switch(outcome) {
      case 'DETECTED': return 'text-[#2e7d32] bg-[#2e7d32]/10 border-[#2e7d32]/30';
      case 'UNDETECTED': return 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30';
      default: return 'text-[#cc3333] bg-[#8b0000]/10 border-[#8b0000]/30';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 75) return 'text-[#2e7d32]';
    if (confidence > 50) return 'text-[var(--color-primary)]';
    return 'text-[#cc3333]';
  };

  return (
    <div className="card-dark p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <FileCheck className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Case Outcome Predictions</h3>
            <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
              AI-Driven Chargesheet Probability
            </p>
          </div>
        </div>
        <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {predictions.length} Cases
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

      {!loading && predictions.length > 0 && (
        <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
          {predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--color-on-dark)]">{pred.caseNo}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{pred.crimeHead}</p>
                </div>
                <span className={`px-2 py-1 rounded-sm text-xs font-bold border ${getOutcomeColor(pred.predictedOutcome)}`}>
                  {pred.predictedOutcome}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-[var(--color-surface-card-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] transition-all"
                        style={{ width: `${pred.chargesheetProbability}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${getConfidenceColor(pred.confidence)}`}>
                      {(pred.chargesheetProbability ?? 0).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[9px] text-[var(--color-muted)] mt-1">
                    {pred.accusedCount} Accused • {pred.hasArrest ? '✓ Arrested' : '✗ Not Arrested'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && predictions.length === 0 && !error && (
        <p className="text-sm text-[var(--color-muted)] text-center py-6 flex-1 flex items-center justify-center">No predictions available for current filters</p>
      )}
    </div>
  );
}
