import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Shield, AlertTriangle, FileText, PieChart, MapPin } from 'lucide-react';

export default function ReportsAnalytics({ crimes, offenders, activeRole }) {
  const [period, setPeriod] = useState('monthly');

  const filteredCrimes = useMemo(() => {
    if (crimes.length === 0) return crimes;
    const latest = new Date(Math.max(...crimes.map(c => new Date(c.registrationDate))));
    const cutoff = new Date(latest);
    if (period === 'monthly') cutoff.setMonth(cutoff.getMonth() - 1);
    else if (period === 'quarterly') cutoff.setMonth(cutoff.getMonth() - 3);
    else cutoff.setFullYear(cutoff.getFullYear() - 1);
    return crimes.filter(c => new Date(c.registrationDate) >= cutoff);
  }, [crimes, period]);

  const metrics = useMemo(() => {
    const total = filteredCrimes.length;
    const heinous = filteredCrimes.filter(c => c.gravity === '1').length;
    const nonHeinous = total - heinous;
    const disposed = filteredCrimes.filter(c => c.caseStatusName === 'Disposed').length;
    const underInvestigation = filteredCrimes.filter(c => c.caseStatusName === 'Under Investigation').length;
    const chargesheeted = filteredCrimes.filter(c => c.caseStatusName === 'Chargesheeted').length;
    const anomalies = filteredCrimes.filter(c => c.isAnomaly).length;
    return { total, heinous, nonHeinous, disposed, underInvestigation, chargesheeted, anomalies, pending: total - disposed };
  }, [filteredCrimes]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredCrimes.forEach(c => {
      map[c.crimeHeadName] = map[c.crimeHeadName] || { count: 0, heinous: 0, label: c.crimeHeadName };
      map[c.crimeHeadName].count++;
      if (c.gravity === '1') map[c.crimeHeadName].heinous++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredCrimes]);

  const stationWise = useMemo(() => {
    const map = {};
    filteredCrimes.forEach(c => {
      map[c.unitName] = map[c.unitName] || { name: c.unitName, district: c.districtName, count: 0, disposed: 0, pending: 0 };
      map[c.unitName].count++;
      if (c.caseStatusName === 'Disposed') map[c.unitName].disposed++;
      else map[c.unitName].pending++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredCrimes]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    filteredCrimes.forEach(c => {
      const m = parseInt(c.registrationDate.split('-')[1]) - 1;
      map[m] = (map[m] || 0) + 1;
    });
    return months.map((label, idx) => ({ label, value: map[idx] || 0 }));
  }, [filteredCrimes]);

  const maxCategory = Math.max(...categoryBreakdown.map(c => c.count), 1);
  const maxMonthly = Math.max(...monthlyData.map(m => m.value), 1);
  const maxStation = Math.max(...stationWise.map(s => s.count), 1);

  const exportPDF = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const refNo = `KSP/REP/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const categoryRows = categoryBreakdown.map(c => `
      <tr>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;">${c.label}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${c.count}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${c.heinous}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${(c.count / metrics.total * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    const stationRows = stationWise.map(s => `
      <tr>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;">${s.name}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${s.district}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${s.count}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${s.disposed}</td>
        <td style="padding:5px 8px;border-bottom:1px solid var(--color-primary)33;font-size:9px;text-align:center;">${s.pending}</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow popups for PDF export.'); return; }

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KSP Crime Report</title>
  <style>
    @page { margin: 0.5in; size: A4; }
    * { box-sizing: border-box; }
    body { margin:0; padding:0; font-family:'Times New Roman',serif; background:#fff; color:#000; }
    .tricolor { height:3px; background:linear-gradient(90deg,#FF9933 0%,#FF9933 33.33%,#FFFFFF 33.33%,#FFFFFF 66.66%,#138808 66.66%,#138808 100%); }
    .header { text-align:center; padding:20px 30px 12px; border-bottom:2px solid #1a237e; }
    .header .title { font-size:22px; font-weight:bold; color:#1a237e; letter-spacing:1px; }
    .header .sub { font-size:13px; color:var(--color-primary); font-weight:600; letter-spacing:3px; text-transform:uppercase; margin-top:3px; }
    .header .govt { font-size:10px; color:#666; margin-top:3px; }
    .header .gold-line { width:70px; height:1.5px; background:var(--color-primary); margin:6px auto; }
    .header .seal { font-size:11px; color:#1a237e; font-weight:bold; margin-top:4px; border:1px solid #1a237e; display:inline-block; padding:3px 18px; }
    .meta { padding:10px 30px; background:#faf8f4; border-bottom:1px solid var(--color-primary)33; font-size:10px; }
    .meta table { width:100%; border-collapse:collapse; }
    .meta td { padding:2px 0; }
    .meta .label { color:#666; width:140px; }
    .meta .value { font-weight:bold; color:#000; }
    .meta .restricted { font-weight:bold; color:#cc3333; }
    .section { padding:12px 30px; }
    .section h2 { font-size:12px; color:#1a237e; font-weight:bold; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--color-primary)33; padding-bottom:5px; margin:0 0 8px; }
    .stats-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
    .stat-card { flex:1; min-width:100px; border:1px solid var(--color-primary)33; padding:8px 12px; text-align:center; }
    .stat-card .num { font-size:18px; font-weight:bold; color:#1a237e; }
    .stat-card .lbl { font-size:8px; color:#666; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }
    table.data { width:100%; border-collapse:collapse; font-size:9px; margin-bottom:12px; }
    table.data thead tr { background:#1a237e; color:#fff; }
    table.data th { padding:5px 8px; text-align:left; font-size:8px; text-transform:uppercase; letter-spacing:1px; }
    table.data td { padding:5px 8px; border-bottom:1px solid var(--color-primary)33; }
    .footer { padding:8px 30px; border-top:2px solid #1a237e; font-size:8px; color:#999; text-align:center; }
    .footer p { margin:1px 0; }
    .footer .warn { color:#cc3333; font-weight:bold; margin-top:3px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="tricolor"></div>
  <div class="header">
    <div class="title">KARNATAKA STATE POLICE</div>
    <div class="sub">Crime Intelligence Portal &mdash; Statistical Report</div>
    <div class="govt">भारत सरकार &bull; Government of Karnataka</div>
    <div class="gold-line"></div>
    <div class="seal">${period === 'monthly' ? 'MONTHLY' : period === 'quarterly' ? 'QUARTERLY' : 'YEARLY'} CRIME REPORT</div>
  </div>
  <div class="meta">
    <table>
      <tr><td class="label">Report Ref No.</td><td class="value" style="font-family:'Courier New',monospace;color:#1a237e;">${refNo}</td></tr>
      <tr><td class="label">Generated On</td><td class="value">${dateStr}</td></tr>
      <tr><td class="label">User Role</td><td class="value" style="text-transform:uppercase;">${activeRole}</td></tr>
      <tr><td class="label">Period</td><td class="value" style="text-transform:uppercase;">${period}</td></tr>
      <tr><td class="label">Classification</td><td class="restricted">RESTRICTED — FOR OFFICIAL USE ONLY</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>&#9679; Executive Summary</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${metrics.total}</div><div class="lbl">Total FIRs</div></div>
      <div class="stat-card"><div class="num">${metrics.heinous}</div><div class="lbl">Heinous Crimes</div></div>
      <div class="stat-card"><div class="num">${metrics.disposed}</div><div class="lbl">Disposed</div></div>
      <div class="stat-card"><div class="num">${metrics.pending}</div><div class="lbl">Under Investigation</div></div>
      <div class="stat-card"><div class="num">${metrics.chargesheeted}</div><div class="lbl">Chargesheeted</div></div>
      <div class="stat-card"><div class="num">${metrics.anomalies}</div><div class="lbl">Anomalies Flagged</div></div>
    </div>
  </div>

  <div class="section">
    <h2>&#9679; Crime Category Breakdown</h2>
    <table class="data">
      <thead><tr><th>Crime Category</th><th style="text-align:center;">Total</th><th style="text-align:center;">Heinous</th><th style="text-align:center;">Share (%)</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>&#9679; Station-Wise Disposal Report</h2>
    <table class="data">
      <thead><tr><th>Police Station</th><th style="text-align:center;">District</th><th style="text-align:center;">Total</th><th style="text-align:center;">Disposed</th><th style="text-align:center;">Pending</th></tr></thead>
      <tbody>${stationRows}</tbody>
    </table>
  </div>

  <div class="footer">
    <p>This report is computer-generated from the KSP Crime Intelligence Portal.</p>
    <p>Unauthorized disclosure or distribution is prohibited under Section 66 of IT Act, 2000.</p>
    <p class="warn">RESTRICTED — FOR OFFICIAL USE ONLY</p>
  </div>
  <div class="tricolor"></div>
  <script>window.onload=function(){window.print()};window.onafterprint=function(){window.close()};</script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="bg-[var(--color-surface-card-dark)] border border-[var(--color-primary)]/15 rounded-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-on-dark)]">Data Reports & Analytics</h2>
              <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-[0.12em] mt-0.5">
                Statistical Crime Reports & Performance Metrics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] rounded-sm p-1">
              {['monthly', 'quarterly', 'yearly'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider transition-all ${
                    period === p ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-on-dark)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={exportPDF}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-sm bg-[var(--color-primary)] text-[var(--color-canvas-dark)] hover:bg-[var(--color-primary-hover)] transition-colors text-[9px] font-bold uppercase tracking-wider"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total FIRs', value: metrics.total, icon: FileText, color: 'text-[var(--color-primary)]', border: 'border-[var(--color-primary)]/20' },
          { label: 'Heinous Crimes', value: metrics.heinous, icon: AlertTriangle, color: 'text-[#cc3333]', border: 'border-[#8b0000]/20' },
          { label: 'Disposed', value: metrics.disposed, icon: TrendingUp, color: 'text-[#2e7d32]', border: 'border-[#2e7d32]/20' },
          { label: 'Under Investigation', value: metrics.underInvestigation, icon: Shield, color: 'text-[var(--color-primary)]', border: 'border-[var(--color-primary)]/20' },
          { label: 'Chargesheeted', value: metrics.chargesheeted, icon: FileText, color: 'text-[var(--color-primary)]', border: 'border-[var(--color-primary)]/20' },
          { label: 'Anomalies Flagged', value: metrics.anomalies, icon: AlertTriangle, color: 'text-[#cc3333]', border: 'border-[#8b0000]/20' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`card-dark p-4 rounded-sm border ${item.border} bg-[var(--color-surface-card-dark)]/80`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">{item.label}</span>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark p-5 relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-4 flex items-center relative z-10 shrink-0">
            <PieChart className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            Crime Category Breakdown
          </h3>
          <div className="space-y-3 relative z-10 flex-1 overflow-y-auto min-h-0 pr-1">
            {categoryBreakdown.map(c => (
              <div key={c.label} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-[var(--color-muted)] group-hover:text-[var(--color-on-dark)] transition-colors">{c.label}</span>
                  <span className="text-[9px] text-[var(--color-muted)] font-mono">{c.count} cases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[var(--color-canvas-dark)] rounded-full h-2.5 border border-[var(--color-hairline-dark)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)]/50 to-[var(--color-primary)] transition-all duration-700 ease-out shadow-[0_0_8px_var(--color-primary)] opacity-80 group-hover:opacity-100" 
                      style={{ width: `${(c.count / maxCategory) * 100}%` }} 
                    />
                  </div>
                  <span className="text-[8px] font-bold text-[#cc3333] w-8 text-right bg-[#cc3333]/10 px-1 py-0.5 rounded-sm">{c.heinous}H</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dark p-5 relative overflow-hidden h-full flex flex-col">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-4 flex items-center relative z-10 shrink-0">
            <Calendar className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            Monthly Registration Trend
          </h3>
          <div className="flex items-end justify-between flex-1 gap-2 relative z-10 pt-4 min-h-0">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-full h-px bg-[var(--color-hairline-dark)]" />
              ))}
            </div>
            
            {monthlyData.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full group">
                <span className="text-[7px] font-mono text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">{m.value || ''}</span>
                <div className="w-full relative rounded-t transition-all duration-300 group-hover:-translate-y-1" style={{ height: `${(m.value / maxMonthly) * 100}%`, minHeight: m.value ? '4px' : '0' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/20 to-[var(--color-primary)] rounded-t shadow-[0_0_10px_var(--color-primary)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 rounded-t" />
                </div>
                <span className="text-[7px] text-[var(--color-muted)] font-medium mt-2 uppercase tracking-widest group-hover:text-[var(--color-on-dark)] transition-colors">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-dark p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[var(--color-on-dark)] flex items-center">
            <MapPin className="h-4 w-4 text-[var(--color-primary)] mr-2" />
            Station-Wise Case Disposal Report
          </h3>
          <div className="flex items-center space-x-3 text-[8px] text-[var(--color-muted)]">
            <span className="flex items-center"><span className="w-2 h-2 rounded bg-[#2e7d32] mr-1" /> Disposed</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded bg-[var(--color-primary)] mr-1" /> Pending</span>
          </div>
        </div>
        <div className="space-y-3 relative z-10">
          {stationWise.map(s => {
            const total = s.count || 1;
            const disposedPct = (s.disposed / total) * 100;
            return (
              <div key={s.name} className="flex items-center space-x-3 group cursor-default">
                <div className="w-28 shrink-0">
                  <p className="text-[10px] font-medium text-[var(--color-muted)] group-hover:text-[var(--color-on-dark)] transition-colors truncate">{s.name}</p>
                  <p className="text-[7px] text-[var(--color-muted)] font-mono">{s.district}</p>
                </div>
                <div className="flex-1 bg-[var(--color-canvas-dark)] rounded-full h-2.5 border border-[var(--color-hairline-dark)] overflow-hidden flex shadow-inner relative group-hover:shadow-[0_0_8px_rgba(255,255,255,0.05)] transition-shadow">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] transition-all duration-700 ease-out group-hover:brightness-110 relative" 
                    style={{ width: `${disposedPct}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/20" />
                  </div>
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-primary)]/70 to-[var(--color-primary)] transition-all duration-700 ease-out group-hover:brightness-110" 
                    style={{ width: `${100 - disposedPct}%` }} 
                  />
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="text-[10px] font-bold text-[var(--color-on-dark)] font-mono">{s.count}</span>
                  <span className="text-[7px] text-[var(--color-muted)] ml-1 tracking-wider">({Math.round(disposedPct)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-dark p-5">
        <h3 className="text-xs font-bold text-[var(--color-on-dark)] mb-3 flex items-center">
          <FileText className="h-4 w-4 text-[var(--color-primary)] mr-2" />
          Processing Efficiency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-sm bg-[var(--color-canvas-dark)] border border-[#2e7d32]/20 text-center">
            <p className="text-2xl font-black text-[#2e7d32]">{metrics.total ? Math.round((metrics.disposed / metrics.total) * 100) : 0}%</p>
            <p className="text-[9px] text-[var(--color-muted)] mt-1">Disposal Rate</p>
          </div>
          <div className="p-4 rounded-sm bg-[var(--color-canvas-dark)] border border-[var(--color-primary)]/20 text-center">
            <p className="text-2xl font-black text-[var(--color-primary)]">{metrics.total ? Math.round((metrics.chargesheeted / metrics.total) * 100) : 0}%</p>
            <p className="text-[9px] text-[var(--color-muted)] mt-1">Chargesheet Rate</p>
          </div>
          <div className="p-4 rounded-sm bg-[var(--color-canvas-dark)] border border-[var(--color-primary)]/20 text-center">
            <p className="text-2xl font-black text-[var(--color-primary)]">{metrics.total ? Math.round((metrics.heinous / metrics.total) * 100) : 0}%</p>
            <p className="text-[9px] text-[var(--color-muted)] mt-1">Heinous Crime Ratio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
