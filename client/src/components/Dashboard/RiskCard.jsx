import React from 'react';
import { Map, ChevronRight } from 'lucide-react';

export default function RiskCard({ offender, onViewNetwork }) {
  const getRiskScoreColor = (score) => {
    if (score >= 80) return { text: 'text-[#cc3333]', bg: 'bg-[#8b0000]/10', border: 'border-[#8b0000]/30', bar: 'bg-[#cc3333]' };
    if (score >= 50) return { text: 'text-blue-400', bg: 'bg-blue-900/50', border: 'border-slate-700', bar: 'bg-blue-600' };
    return { text: 'text-[#2e7d32]', bg: 'bg-[#2e7d32]/10', border: 'border-[#2e7d32]/30', bar: 'bg-[#2e7d32]' };
  };

  const scoreTheme = getRiskScoreColor(offender.riskScore);

  return (
    <div className={`glass-card p-5 rounded-2xl border border-slate-800 bg-slate-800/50 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between h-[230px] shadow-md group relative overflow-hidden`}>
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${scoreTheme.bar}`} />

      <div>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-50 group-hover:text-blue-400 transition-colors">
              {offender.name}
            </h4>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.1em] mt-0.5 block">
              {offender.gender} &bull; Age {offender.age}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${scoreTheme.bg} ${scoreTheme.text} ${scoreTheme.border}`}>
              Risk: {offender.riskScore}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
          <div className={`h-full rounded-full ${scoreTheme.bar}`} style={{ width: `${offender.riskScore}%` }} />
        </div>

        <div className="mt-3.5 bg-slate-950/40 p-2.5 rounded-xl border border-blue-500/5 max-h-[64px] overflow-hidden">
          <p className="text-[11px] text-slate-400 leading-normal italic line-clamp-2">
            &ldquo;{offender.moPhrase || 'Operates via coordinated vehicle compartments'}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3">
        <div className="flex space-x-4">
          <div className="text-[9px]">
            <span className="text-slate-400 font-semibold block uppercase tracking-[0.08em]">Total Crimes</span>
            <span className="text-xs font-bold text-slate-50 mt-0.5 block">{offender.caseCount} Cases</span>
          </div>
          <div className="text-[9px]">
            <span className="text-slate-400 font-semibold block uppercase tracking-[0.08em]">Footprint</span>
            <span className="text-xs font-bold text-slate-50 mt-0.5 block flex items-center">
              <Map className="h-3 w-3 mr-0.5 text-slate-400" />
              {offender.distinctDistricts} Districts
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewNetwork(offender)}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 group-hover:text-blue-400 group-hover:border-slate-700 group-hover:bg-blue-900/40 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
