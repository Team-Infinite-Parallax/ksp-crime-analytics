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

  return (
    <div className="card-dark p-6 flex flex-col justify-between h-40">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[14px] font-medium text-[var(--color-muted)] block">
            {title}
          </span>
          <h2 className="text-[40px] font-bold font-plex text-[var(--color-primary)] tracking-tighter leading-none">{value}</h2>
        </div>
        <Icon className="h-6 w-6 text-[var(--color-muted)]" />
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center space-x-2">
          <span className={`flex items-center text-[14px] font-plex ${isPositive
              ? 'text-[var(--color-trading-up)]'
              : 'text-[var(--color-trading-down)]'
            }`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1 shrink-0" /> : <TrendingDown className="h-4 w-4 mr-1 shrink-0" />}
            {trend}
          </span>
          <span className="text-[12px] text-[var(--color-muted)]">vs prev month</span>
        </div>

        <div className="w-[80px] h-[32px] shrink-0 opacity-60">
          <svg className="w-full h-full">
            <path d={linePath} fill="none" className={isPositive ? "stroke-[var(--color-trading-up)]" : "stroke-[var(--color-trading-down)]"} strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
