import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

export default function CrimeTrendsChart({ title, data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map(d => d.value);
  const labels = data.map(d => d.label);

  const minVal = 0;
  const maxVal = Math.max(...values, 100) * 1.15;
  const range = maxVal - minVal;

  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const linePath = `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaPath = `${linePath} L ${(paddingLeft + chartWidth).toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} L ${paddingLeft.toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} Z`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgScale = width / rect.width;
    const chartMouseX = mouseX * svgScale;

    let nearestIdx = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - chartMouseX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    setHoveredIdx(nearestIdx);
    const nearestPoint = points[nearestIdx];
    const tooltipX = nearestPoint.x / svgScale;
    const tooltipY = nearestPoint.y / svgScale;
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const gridCount = 4;
  const yGrids = Array.from({ length: gridCount }).map((_, idx) => {
    const val = minVal + (idx / (gridCount - 1)) * range;
    const y = paddingTop + chartHeight - (idx / (gridCount - 1)) * chartHeight;
    return { val: Math.round(val), y };
  });

  return (
    <div className="card-dark p-6 flex flex-col h-[340px] relative select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[20px] font-semibold text-[var(--color-on-dark)]">{title}</h3>
          <p className="text-[14px] text-[var(--color-muted)] font-medium mt-0.5">Statistical Trend Projection</p>
        </div>
        <div className="flex items-center space-x-2 text-[14px] text-[var(--color-primary)] font-bold bg-[var(--color-surface-elevated-dark)] px-4 py-2 rounded-sm">
          <Calendar className="h-4 w-4" />
          <span>Year-on-Year</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full grow relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--color-primary)" floodOpacity="0.2" />
            </filter>
          </defs>

          {yGrids.map((g, idx) => (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={g.y}
                x2={width - paddingRight}
                y2={g.y}
                stroke="var(--color-hairline-dark)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={g.y + 4}
                fill="var(--color-muted)"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
                fontWeight="500"
              >
                {g.val}
              </text>
            </g>
          ))}

          {points.map((p, idx) => {
            const showLabel = points.length <= 12 || idx % 2 === 0;
            if (!showLabel) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingBottom + 18}
                fill="var(--color-muted)"
                fontSize="12"
                fontFamily="var(--font-nova)"
                fontWeight="500"
                textAnchor="middle"
              >
                {p.label}
              </text>
            );
          })}

          <path d={areaPath} fill="url(#chart-area-grad)" />

          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {hoveredIdx !== null && (
            <>
              <line
                x1={points[hoveredIdx].x}
                y1={paddingTop}
                x2={points[hoveredIdx].x}
                y2={height - paddingBottom}
                stroke="var(--color-hairline-dark)"
                strokeWidth="1.5"
              />
              <circle
                cx={points[hoveredIdx].x}
                cy={points[hoveredIdx].y}
                r="5"
                fill="var(--color-canvas-dark)"
                stroke="var(--color-primary)"
                strokeWidth="3"
              />
            </>
          )}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute bg-[var(--color-surface-card-dark)] border border-[var(--color-hairline-dark)] rounded-sm p-3 shadow-lg pointer-events-none z-30 flex flex-col items-start translate-x-3 -translate-y-12"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <span className="text-[12px] text-[var(--color-muted)] font-medium">{points[hoveredIdx].label}</span>
            <span className="text-[16px] font-bold font-plex text-[var(--color-on-dark)] mt-0.5">
              Cases: <span className="text-[var(--color-primary)]">{points[hoveredIdx].value}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
