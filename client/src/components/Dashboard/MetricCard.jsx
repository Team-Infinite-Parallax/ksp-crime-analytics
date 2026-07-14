import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, trend, isPositive, icon: Icon, sparklineData }) {
  const width = 120;
  const height = 32;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - 2 - ((val - minVal) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="card-dark p-4 sm:p-6 flex flex-col justify-between h-full min-h-[180px] sm:min-h-[200px] hover:-translate-y-1 transition-transform duration-300 cursor-default group relative overflow-hidden">
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <span className="text-[14px] font-medium text-[var(--color-muted)] block">
            {title}
          </span>
          <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold font-plex text-[var(--color-on-dark)] tracking-tighter leading-none">{value}</h2>
        </div>
        <div className="p-2 bg-[var(--color-surface-elevated-dark)] rounded-lg border border-[var(--color-hairline-dark)] group-hover:border-[var(--color-primary)] transition-colors">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-2 relative z-10">
        <div className="flex items-center space-x-2">
          <span className={`flex items-center text-[14px] font-plex font-bold ${isPositive
              ? 'text-[var(--color-trading-up)]'
              : 'text-[var(--color-trading-down)]'
            }`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1 shrink-0" /> : <TrendingDown className="h-4 w-4 mr-1 shrink-0" />}
            {trend}
          </span>
          <span className="text-[12px] text-[var(--color-muted)]">vs prev</span>
        </div>

        <div className="w-[80px] h-[32px] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "var(--color-trading-up)" : "var(--color-trading-down)"} stopOpacity="0.2" />
                <stop offset="100%" stopColor={isPositive ? "var(--color-trading-up)" : "var(--color-trading-down)"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} stroke="none" />
            <path d={linePath} fill="none" className={isPositive ? "stroke-[var(--color-trading-up)]" : "stroke-[var(--color-trading-down)]"} strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
