import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Users, TrendingUp } from 'lucide-react';

const TYPOLOGY_ICONS = {
  'Organized Network': '🕷️',
  'Repeat Street Offender': '🚗',
  'Specialized Professional': '💼',
  'Wandering Opportunist': '🗺️'
};

export default function BehavioralProfiles({ filters = {} }) {
  const [clusters, setClusters] = useState([]);
  const [typologies, setTypologies] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/clustering?type=offender`, {
          headers: {
            'x-employee-role': localStorage.getItem('userRole') || 'SCRB_ADMIN',
            'x-employee-email': localStorage.getItem('userEmail') || 'test@ksp.in'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch clusters');
        
        const result = await response.json();
        setClusters(result.clusters || []);
        setTypologies(result.typologies || []);
        setSummary(result.summary || []);
      } catch (err) {
        console.error('Clustering fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
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

  return (
    <div className="card-dark p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <Users className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-on-dark)]">Offender Behavioral Profiles</h3>
            <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
              AI-Driven Typology Classification
            </p>
          </div>
        </div>
        <span className="text-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {clusters.reduce((sum, c) => sum + c.size, 0)} Offenders
        </span>
      </div>

      {/* Typology Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {typologies.map((type, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-sm border-2 cursor-pointer transition-all ${
              selectedCluster === idx
                ? `border-[${type.color}] bg-[${type.color}]/10`
                : `border-[var(--color-hairline-dark)] hover:border-[${type.color}]/50`
            }`}
            onClick={() => setSelectedCluster(selectedCluster === idx ? null : idx)}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{TYPOLOGY_ICONS[type.typology] || '👤'}</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated-dark)] text-[var(--color-muted)]">
                {type.memberCount}
              </span>
            </div>
            <h4 className="text-xs font-bold text-[var(--color-on-dark)] mb-1">{type.typology}</h4>
            <p className="text-[9px] text-[var(--color-muted)]">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Cluster Characteristics */}
      {selectedCluster !== null && typologies[selectedCluster] && (
        <div className="p-4 bg-[var(--color-surface-elevated-dark)] rounded-sm border border-[var(--color-hairline-dark)] space-y-4">
          <div>
            <h4 className="text-sm font-bold text-[var(--color-on-dark)] mb-3">
              {typologies[selectedCluster].typology} Profile
            </h4>
            
            <div className="space-y-3">
              {/* Behavioral Metrics */}
              {Object.entries(typologies[selectedCluster].characteristics).map(([key, value]) => {
                const labels = {
                  avgFrequency: 'Crime Frequency',
                  avgSeverity: 'Crime Severity',
                  avgMobility: 'Geographic Mobility',
                  avgSpecialization: 'Crime Specialization'
                };
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold text-[var(--color-muted)]">{labels[key]}</span>
                      <span className="text-[10px] font-bold text-[var(--color-on-dark)]">{value}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-canvas-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Members */}
          {clusters[selectedCluster] && clusters[selectedCluster].members.length > 0 && (
            <div className="pt-4 border-t border-[var(--color-hairline-dark)]">
              <h5 className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Top Members ({clusters[selectedCluster].members.length})
              </h5>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {clusters[selectedCluster].members.slice(0, 8).map((member, midx) => (
                  <div key={midx} className="flex items-center justify-between text-[9px] p-2 bg-[var(--color-canvas-dark)] rounded">
                    <span className="text-[var(--color-on-dark)] font-semibold">{member.name}</span>
                    <span className="text-[var(--color-muted)]">{member.rawData.caseCount} cases</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Table */}
      {!selectedCluster && summary.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-[var(--color-muted)] uppercase font-bold tracking-wider">Cluster Distribution</p>
          <div className="grid grid-cols-2 gap-2">
            {summary.map((item, idx) => (
              <div key={idx} className="p-3 bg-[var(--color-surface-elevated-dark)] rounded-sm text-center">
                <p className="text-xs font-bold text-[var(--color-on-dark)]">{item.typology}</p>
                <p className="text-sm font-black text-[var(--color-primary)] mt-1">{item.count}</p>
                <p className="text-[8px] text-[var(--color-muted)]">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
