import React from 'react';

const ALERT_TYPES = {
  critical: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cc3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 mt-0.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    border: '#cc3333',
    bg: '#cc3333',
    label: 'CRITICAL'
  },
  warning: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9933" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 mt-0.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    border: '#ff9933',
    bg: '#ff9933',
    label: 'WARNING'
  },
  info: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3399ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
    ),
    border: '#3399ff',
    bg: '#3399ff',
    label: 'INFO'
  },
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 mt-0.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    border: '#2e7d32',
    bg: '#2e7d32',
    label: 'SUCCESS'
  }
};

export default function AlertNotification({ type = 'critical', title, children, className = '' }) {
  const config = ALERT_TYPES[type] || ALERT_TYPES.critical;

  return (
    <div className={`rounded-2xl p-4 flex items-start space-x-3 ${className}`}
      style={{
        backgroundColor: `${config.bg}11`,
        borderColor: `${config.border}33`,
        borderWidth: 1,
      }}
    >
      {config.icon}
      <div className="text-[11px] leading-relaxed">
        {title && (
          <p className="font-extrabold uppercase tracking-wider" style={{ color: config.border }}>
            {title}
          </p>
        )}
        <div className="mt-1" style={{ color: 'var(--color-muted)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export { ALERT_TYPES };
