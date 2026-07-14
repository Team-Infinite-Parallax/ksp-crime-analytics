import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Clock, Users, Loader, X, CheckCircle } from 'lucide-react';
import { MOCK_ALERTS, fetchWithFallback } from '../../utils/mockApi';

const SEVERITY_CONFIG = {
  critical: { color: '#cc3333', bg: '#8b0000', label: 'CRITICAL', icon: AlertTriangle },
  high: { color: '#ff9933', bg: '#cc6600', label: 'HIGH', icon: AlertTriangle },
  medium: { color: '#3399ff', bg: '#0066cc', label: 'MEDIUM', icon: AlertCircle },
  low: { color: '#66cc33', bg: '#339900', label: 'LOW', icon: AlertCircle }
};

export default function AlertCenter({ isOpen, onClose, filters = {} }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [acknowledged, setAcknowledged] = useState(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          limit: 100
        });

        const response = await fetch(`/alerts?${queryParams}`, {
          headers: {
            'x-employee-role': localStorage.getItem('userRole') || 'SCRB_ADMIN',
            'x-employee-email': localStorage.getItem('userEmail') || 'test@ksp.in'
          }
        });

        const result = await fetchWithFallback(`/alerts?${queryParams}`);
        setAlerts(result?.alerts || MOCK_ALERTS);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleAcknowledge = async (alertId) => {
    try {
      const response = await fetch('/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-role': localStorage.getItem('userRole') || 'SCRB_ADMIN',
          'x-employee-email': localStorage.getItem('userEmail') || 'test@ksp.in'
        },
        body: JSON.stringify({ alertId })
      });

      if (response.ok) {
        setAcknowledged(prev => new Set([...prev, alertId]));
      }
    } catch (err) {
      console.error('Acknowledge error:', err);
    }
  };

  if (!isOpen) return null;

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end">
      <div className="w-96 h-screen bg-[var(--color-canvas-dark)] border-l border-[var(--color-hairline-dark)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-hairline-dark)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-on-dark)]">Active Alerts</h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {criticalCount} Critical • {highCount} High Priority
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-elevated-dark)] rounded-sm transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-muted)]" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <p className="text-center text-[var(--color-muted)] py-8">No active alerts</p>
          )}

          {!loading && alerts.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const isAcknowledged = acknowledged.has(alert.alertId);

            return (
              <div
                key={alert.alertId}
                className={`p-3 rounded-sm border-l-4 cursor-pointer transition-all ${
                  isAcknowledged 
                    ? 'bg-[var(--color-surface-card-dark)] border-l-[var(--color-muted)] opacity-60'
                    : 'bg-opacity-10'
                }`}
                style={{
                  backgroundColor: isAcknowledged ? undefined : `${config.bg}1A`,
                  borderLeftColor: isAcknowledged ? undefined : config.color,
                }}
                onClick={() => setExpandedAlert(expandedAlert === alert.alertId ? null : alert.alertId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <config.icon className="h-4 w-4" style={{ color: config.color }} />
                      <span className="text-xs font-bold uppercase" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-on-dark)] mt-1">{alert.caseNo}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{alert.crimeHead}</p>
                  </div>
                  {!isAcknowledged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.alertId);
                      }}
                      className="p-1 hover:bg-[var(--color-surface-elevated-dark)] rounded transition-colors"
                      title="Acknowledge alert"
                    >
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedAlert === alert.alertId && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-hairline-dark)] space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-[var(--color-muted)]" />
                      <span className="text-[var(--color-muted)]">{alert.daysOpen} days open</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-[var(--color-muted)]" />
                      <span className="text-[var(--color-muted)]">
                        {alert.accusedCount} accused, {alert.arrestCount} arrested
                      </span>
                    </div>
                    <p className="text-[var(--color-muted)] italic">{alert.message}</p>
                    <div className="text-[9px] text-[var(--color-muted)] pt-2">
                      {alert.district} • {alert.unit}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-hairline-dark)] bg-[var(--color-surface-card-dark)]">
          <p className="text-[9px] text-[var(--color-muted)] text-center">
            Updates every 30 seconds • Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
