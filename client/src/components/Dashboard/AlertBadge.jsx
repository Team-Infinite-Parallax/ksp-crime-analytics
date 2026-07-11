import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export default function AlertBadge({ onClick, disabled = false }) {
  const [criticalCount, setCriticalCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const fetchAlertCounts = async () => {
      try {
        const response = await fetch('/alerts?limit=50', {
          headers: {
            'x-employee-role': localStorage.getItem('userRole') || 'SCRB_ADMIN',
            'x-employee-email': localStorage.getItem('userEmail') || 'test@ksp.in'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setCriticalCount(result.critical || 0);
          setHighCount(result.high || 0);
          
          // Pulse animation if there are critical alerts
          if ((result.critical || 0) > 0) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 3000);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.error('Alert fetch error:', err);
      }
    };

    fetchAlertCounts();
    const interval = setInterval(fetchAlertCounts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = criticalCount + highCount;

  if (disabled || totalAlerts === 0) {
    return (
      <button
        onClick={onClick}
        className="p-2 hover:bg-[var(--color-surface-elevated-dark)] rounded-sm transition-colors"
        title="View alerts"
      >
        <Bell className="h-5 w-5 text-[var(--color-muted)]" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[var(--color-surface-elevated-dark)] rounded-sm transition-colors"
      title={`${totalAlerts} alerts`}
    >
      {criticalCount > 0 && (
        <AlertTriangle className={`h-5 w-5 text-[#cc3333] ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {criticalCount === 0 && highCount > 0 && (
        <Bell className="h-5 w-5 text-[#ff9933]" />
      )}
      
      {totalAlerts > 0 && (
        <div className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#cc3333] text-[10px] font-bold text-white">
          {totalAlerts > 9 ? '9+' : totalAlerts}
        </div>
      )}
    </button>
  );
}
