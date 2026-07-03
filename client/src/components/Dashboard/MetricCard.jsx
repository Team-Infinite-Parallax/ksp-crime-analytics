import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, trend, isPositive, icon: Icon, sparklineData, color }) {
  const colorMap = {
    blue: {
      border: 'border-[#2b5f9e]/20 hover:border-[#2b5f9e]/40',
      bg: 'from-[#2b5f9e]/5 to-[#2b5f9e]/1',
      iconBg: 'bg-[#2b5f9e]/10 text-[#2b5f9e] border-[#2b5f9e]/20',
      line: 'stroke-[#2b5f9e]',
      fill: 'url(#gradient-blue)'
    },
    amber: {
      border: 'border-slate-700 hover:border-blue-500/40',
      bg: 'from-[#d4a853]/5 to-[#d4a853]/1',
      iconBg: 'bg-blue-900/50 text-blue-400 border-slate-700',
      line: 'stroke-[#d4a853]',
      fill: 'url(#gradient-amber)'
    },
    green: {
      border: 'border-[#2e7d32]/20 hover:border-[#2e7d32]/40',
      bg: 'from-[#2e7d32]/5 to-[#2e7d32]/1',
      iconBg: 'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/20',
      line: 'stroke-[#2e7d32]',
      fill: 'url(#gradient-green)'
    },
    red: {
      border: 'border-[#8b0000]/20 hover:border-[#8b0000]/40',
      bg: 'from-[#8b0000]/5 to-[#8b0000]/1',
      iconBg: 'bg-[#8b0000]/10 text-[#cc3333] border-[#8b0000]/20',
      line: 'stroke-[#cc3333]',
      fill: 'url(#gradient-red)'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  const width = 120;
  const height = 40;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - 5 - ((val - minVal) / range) * (height - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className={`glass-card p-5 rounded-2xl border ${scheme.border} bg-gradient-to-br ${scheme.bg} flex flex-col justify-between h-40 hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 group-hover:text-slate-50/70 transition-colors">
            {title}
          </span>
          <h2 className="text-2xl font-black text-slate-50 tracking-tight">{value}</h2>
        </div>
        <div className={`p-2.5 rounded-xl border ${scheme.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="flex items-center space-x-1.5">
          <span className={`flex items-center text-xs font-black px-2 py-0.5 rounded-lg border ${isPositive
              ? 'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/20'
              : 'bg-[#8b0000]/10 text-[#cc3333] border-[#8b0000]/20'
            }`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5 shrink-0" /> : <TrendingDown className="h-3 w-3 mr-0.5 shrink-0" />}
            {trend}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">vs prev month</span>
        </div>

        <div className="w-[120px] h-[40px] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color === 'red' ? '#cc3333' : color === 'green' ? '#2e7d32' : color === 'amber' ? '#d4a853' : '#2b5f9e'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color === 'red' ? '#cc3333' : color === 'green' ? '#2e7d32' : color === 'amber' ? '#d4a853' : '#2b5f9e'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={scheme.fill} />
            <path d={linePath} fill="none" className={scheme.line} strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
