import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Download } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';


const suggestions = [
  "Show me all crimes this week",
  "How many cyber crimes?",
  "List high risk offenders",
  "Crime trends this month",
  "Burglary cases in Shivajinagar",
  "Who is the top offender?"
];

const crimeData = {
  crimes: [
    { crimeNo: '10041202600001', type: 'Property Offences', sub: 'Burglary by Night', ps: 'Shivajinagar PS', district: 'Bengaluru Urban', status: 'Under Investigation', date: '2026-07-01', gravity: 'Heinous' },
    { crimeNo: '10041202600002', type: 'Cyber Crimes', sub: 'Online Financial Fraud', ps: 'Indiranagar PS', district: 'Bengaluru Urban', status: 'Chargesheeted', date: '2026-06-29', gravity: 'Non-Heinous' },
    { crimeNo: '10042202600003', type: 'Crimes Against Body', sub: 'Murder for Gain', ps: 'Shivajinagar PS', district: 'Bengaluru Urban', status: 'Under Investigation', date: '2026-06-28', gravity: 'Heinous' },
    { crimeNo: '10043202600004', type: 'Property Offences', sub: 'Vehicle Theft', ps: 'Devaraja PS', district: 'Mysuru', status: 'Disposed', date: '2026-06-25', gravity: 'Non-Heinous' },
    { crimeNo: '10044202600005', type: 'Narcotics NDPS', sub: 'Cannabis/Ganja Possession', ps: 'Mangaluru South PS', district: 'Dakshina Kannada', status: 'Chargesheeted', date: '2026-06-20', gravity: 'Heinous' },
    { crimeNo: '10045202600006', type: 'Cyber Crimes', sub: 'Online Obscenity', ps: 'Belagavi Town PS', district: 'Belagavi', status: 'Under Investigation', date: '2026-06-18', gravity: 'Non-Heinous' },
    { crimeNo: '10046202600007', type: 'Property Offences', sub: 'Theft (Other)', ps: 'Kalaburagi City PS', district: 'Kalaburagi', status: 'Disposed', date: '2026-06-15', gravity: 'Non-Heinous' },
    { crimeNo: '10041202600008', type: 'Property Offences', sub: 'Burglary by Night', ps: 'Halasuru PS', district: 'Bengaluru Urban', status: 'Under Investigation', date: '2026-06-12', gravity: 'Heinous' }
  ],
  offenders: [
    { name: 'Rajesh Choudhary', risk: 92, cases: 11, districts: 3, mo: 'posed as bank official via mobile phone and extracted OTP' },
    { name: 'Imran Basappa', risk: 84, cases: 8, districts: 2, mo: 'gained entry through rear window after removing iron grille' },
    { name: 'Sneha Yellappa', risk: 78, cases: 6, districts: 2, mo: 'created fake matrimonial profile online and defrauded multiple victims' },
    { name: 'Vikas Gupta', risk: 65, cases: 5, districts: 1, mo: 'waylaid victim near ATM and snatched gold chain and mobile phone' },
    { name: 'Anil Deshpande', risk: 49, cases: 4, districts: 1, mo: 'pushed parked motorcycle silently and departed using hotwire ignition technique' }
  ]
};

function generateResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `नमस्ते! I am **KSP CopBot** — your AI Crime Intelligence Assistant. Ask me about crimes, offenders, trends, or say "help" for examples.`;
  }

  if (q.includes('help')) {
    return `Try asking:\n• "Show me all crimes"\n• "How many cyber crimes?"\n• "High risk offenders"\n• "Crime trends this month"\n• "Burglary in Shivajinagar"`;
  }

  if (q.includes('all crime') || q.includes('show crime') || q.includes('list crime') || q.includes('crime list')) {
    const c = crimeData.crimes;
    return `📋 **All FIRs (${c.length} total):**\n${c.slice(0, 5).map(x => `• ${x.crimeNo} — ${x.sub} (${x.ps}), ${x.status}`).join('\n')}\n\n_Showing top 5 of ${c.length}. Use filters for specific queries._`;
  }

  if (q.includes('cyber crime') || q.includes('cyber')) {
    const c = crimeData.crimes.filter(x => x.type === 'Cyber Crimes');
    return `🖥️ **Cyber Crimes:** ${c.length} case(s) found\n${c.map(x => `• ${x.crimeNo} — ${x.sub} @ ${x.ps} (${x.status})`).join('\n')}`;
  }

  if (q.includes('burglary')) {
    const c = crimeData.crimes.filter(x => x.sub.toLowerCase().includes('burglary'));
    return `🏠 **Burglary Cases:** ${c.length} found\n${c.map(x => `• ${x.crimeNo} — ${x.ps}, ${x.district} (${x.status})`).join('\n')}`;
  }

  if (q.includes('murder') || q.includes('body') || q.includes('homicide') || q.includes('death')) {
    const c = crimeData.crimes.filter(x => x.type === 'Crimes Against Body');
    return `⚠️ **Crimes Against Body:** ${c.length} case(s)\n${c.map(x => `• ${x.crimeNo} — ${x.sub} @ ${x.ps} (${x.status})`).join('\n')}`;
  }

  if (q.includes('narcotic') || q.includes('ndps') || q.includes('drug') || q.includes('cannabis') || q.includes('ganja')) {
    const c = crimeData.crimes.filter(x => x.type === 'Narcotics NDPS');
    return `🌿 **Narcotics Cases:** ${c.length} found\n${c.map(x => `• ${x.crimeNo} — ${x.sub} @ ${x.ps} (${x.status})`).join('\n')}`;
  }

  if (q.includes('property') || q.includes('theft') || q.includes('vehicle')) {
    const c = crimeData.crimes.filter(x => x.type === 'Property Offences');
    return `💰 **Property Offences:** ${c.length} case(s)\n${c.map(x => `• ${x.crimeNo} — ${x.sub} @ ${x.ps} (${x.status})`).join('\n')}`;
  }

  if ((q.includes('high risk') || q.includes('top offender') || q.includes('dangerous') || q.includes('critical')) && !q.includes('shivajinagar')) {
    const o = crimeData.offenders.filter(x => x.risk >= 80);
    return `🚨 **High-Risk Offenders (${o.length}):**\n${o.map(x => `• **${x.name}** — Risk ${x.risk}%, ${x.cases} cases, ${x.districts} districts\n  MO: _${x.mo}_`).join('\n')}`;
  }

  if (q.includes('offender') || q.includes('criminal') || q.includes('repeat')) {
    const all = crimeData.offenders.sort((a, b) => b.risk - a.risk);
    return `👤 **All Tracked Offenders (${all.length}):**\n${all.map(x => `• ${x.name} — Risk ${x.risk}% | ${x.cases} cases | ${x.districts} districts`).join('\n')}`;
  }

  if (q.includes('trend') || q.includes('this month') || q.includes('this week') || q.includes('recent')) {
    const recent = crimeData.crimes.filter(x => x.date >= '2026-06-25');
    return `📈 **Recent Crime Activity (since 25 Jun 2026):**\n${recent.length} cases registered\n${recent.map(x => `• ${x.date} — ${x.sub} @ ${x.ps} [${x.gravity}]`).join('\n')}`;
  }

  if (q.includes('shivajinagar') || (q.includes('ps') && q.includes('shivaji'))) {
    const c = crimeData.crimes.filter(x => x.ps === 'Shivajinagar PS');
    const o = crimeData.offenders.filter(x => x.name === 'Rajesh Choudhary' || x.name === 'Imran Basappa');
    return `🏛️ **Shivajinagar PS Report:**\n• Active Cases: ${c.length}\n${c.map(x => `  • ${x.crimeNo} — ${x.sub} (${x.status})`).join('\n')}\n• Tracked Offenders: ${o.length}\n${o.map(x => `  • ${x.name} (Risk ${x.risk}%)`).join('\n')}`;
  }

  if (q.includes('karnataka') || q.includes('state') || q.includes('total')) {
    return `📊 **Karnataka State Summary:**\n• Total FIRs: ${crimeData.crimes.length}\n• Active Investigations: ${crimeData.crimes.filter(x => x.status === 'Under Investigation').length}\n• Disposed: ${crimeData.crimes.filter(x => x.status === 'Disposed').length}\n• Tracked Offenders: ${crimeData.offenders.length}\n• High-Risk: ${crimeData.offenders.filter(x => x.risk >= 80).length}`;
  }

  return `I couldn't find a specific match for "${query}". Try:\n• "All crimes"\n• "Cyber crimes"\n• "High risk offenders"\n• "Crime trends this week"\n• "Burglary in Shivajinagar"\n• "Help" for more examples.`;
}

export default function CopBot() {
  const { activeRole } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: `🤖 **KSP CopBot Active**\nनमस्ते! I'm your AI Crime Assistant for **${activeRole}**. Ask me anything about crimes, offenders, or trends.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const exportChat = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const refNo = `KSP/CopBot/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const chatRows = messages.map((msg, i) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid var(--color-primary)33;vertical-align:top;width:60px;font-size:10px;color:#666;font-family:'Courier New',monospace;">${String(i + 1).padStart(2, '0')}</td>
        <td style="padding:6px 10px;border-bottom:1px solid var(--color-primary)33;vertical-align:top;width:80px;font-size:10px;color:#1a237e;font-weight:700;font-family:'Courier New',monospace;">${msg.from === 'user' ? 'OFFICER' : 'COP BOT'}</td>
        <td style="padding:6px 10px;border-bottom:1px solid var(--color-primary)33;vertical-align:top;font-size:10px;color:#333;line-height:1.5;font-family:'Courier New',monospace;white-space:pre-wrap;">${msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</td>
      </tr>
    `).join('');

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family:'Times New Roman',serif;margin:0;padding:0;">
        <div style="height:3px;background:linear-gradient(90deg,#FF9933 0%,#FF9933 33.33%,#FFFFFF 33.33%,#FFFFFF 66.66%,#138808 66.66%,#138808 100%);"></div>
        <div style="padding:20px 30px 15px;text-align:center;border-bottom:2px solid #1a237e;">
          <div style="font-size:22px;font-weight:bold;color:#1a237e;letter-spacing:1px;">KARNATAKA STATE POLICE</div>
          <div style="font-size:13px;color:var(--color-primary);margin-top:3px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">Crime Intelligence Portal</div>
          <div style="font-size:10px;color:#666;margin-top:3px;">भारत सरकार &bull; Government of Karnataka</div>
          <div style="width:80px;height:1.5px;background:var(--color-primary);margin:8px auto;"></div>
          <div style="font-size:11px;color:#1a237e;font-weight:bold;margin-top:4px;border:1px solid #1a237e;display:inline-block;padding:3px 16px;">OFFICIAL CHAT TRANSCRIPT</div>
        </div>
        <div style="padding:12px 30px;background:#faf8f4;border-bottom:1px solid var(--color-primary)33;font-size:10px;color:#333;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:2px 0;color:#666;width:120px;">Conversation Ref No.</td><td style="font-weight:bold;color:#1a237e;font-family:'Courier New',monospace;">${refNo}</td></tr>
            <tr><td style="padding:2px 0;color:#666;">Date of Transcript</td><td style="font-weight:bold;">${dateStr}</td></tr>
            <tr><td style="padding:2px 0;color:#666;">Time of Export</td><td style="font-weight:bold;">${timeStr} IST</td></tr>
            <tr><td style="padding:2px 0;color:#666;">User Role</td><td style="font-weight:bold;text-transform:uppercase;">${activeRole}</td></tr>
            <tr><td style="padding:2px 0;color:#666;">Total Exchanges</td><td style="font-weight:bold;">${messages.length}</td></tr>
            <tr><td style="padding:2px 0;color:#666;">Classification</td><td style="font-weight:bold;color:#cc3333;">RESTRICTED — FOR OFFICIAL USE ONLY</td></tr>
          </table>
        </div>
        <div style="padding:15px 30px;">
          <div style="font-size:10px;color:#1a237e;font-weight:bold;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">&#9679; Intelligence Query Log</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#1a237e;color:#fff;font-size:9px;text-transform:uppercase;letter-spacing:1px;">
                <th style="padding:6px 10px;text-align:left;">#</th>
                <th style="padding:6px 10px;text-align:left;">Source</th>
                <th style="padding:6px 10px;text-align:left;">Message</th>
              </tr>
            </thead>
            <tbody>
              ${chatRows}
            </tbody>
          </table>
        </div>
        <div style="padding:10px 30px;border-top:2px solid #1a237e;font-size:8px;color:#999;text-align:center;">
          <p style="margin:2px 0;">This document is a computer-generated transcript of the KSP CopBot conversation.</p>
          <p style="margin:2px 0;">Unauthorized disclosure, copying, or distribution is prohibited under Section 66 of IT Act, 2000.</p>
          <p style="margin:4px 0 0;color:#cc3333;font-weight:bold;">RESTRICTED — FOR OFFICIAL USE ONLY</p>
        </div>
        <div style="height:3px;background:linear-gradient(90deg,#FF9933 0%,#FF9933 33.33%,#FFFFFF 33.33%,#FFFFFF 66.66%,#138808 66.66%,#138808 100%);"></div>
      </div>
    `;

    element.style.width = '800px';
    element.style.background = '#ffffff';
    element.style.padding = '0';
    element.style.margin = '20px auto';
    element.style.fontFamily = '"Times New Roman", serif';
    document.body.appendChild(element);

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KSP CopBot Transcript</title>
  <style>
    @page { margin: 0.6in; size: A4; }
    * { box-sizing: border-box; }
    body { margin:0; padding:0; font-family:'Times New Roman',serif; background:#fff; color:#000; }
    .tricolor { height:3px; background:linear-gradient(90deg,#FF9933 0%,#FF9933 33.33%,#FFFFFF 33.33%,#FFFFFF 66.66%,#138808 66.66%,#138808 100%); }
    .header { text-align:center; padding:25px 40px 15px; border-bottom:2px solid #1a237e; }
    .header .title { font-size:24px; font-weight:bold; color:#1a237e; letter-spacing:1px; }
    .header .sub { font-size:14px; color:var(--color-primary); font-weight:600; letter-spacing:3px; text-transform:uppercase; margin-top:3px; }
    .header .govt { font-size:11px; color:#666; margin-top:3px; }
    .header .gold-line { width:80px; height:1.5px; background:var(--color-primary); margin:8px auto; }
    .header .seal { font-size:12px; color:#1a237e; font-weight:bold; margin-top:4px; border:1px solid #1a237e; display:inline-block; padding:3px 20px; }
    .meta { padding:12px 40px; background:#faf8f4; border-bottom:1px solid var(--color-primary)33; font-size:11px; }
    .meta table { width:100%; border-collapse:collapse; }
    .meta td { padding:2px 0; }
    .meta .label { color:#666; width:140px; }
    .meta .value { font-weight:bold; color:#000; }
    .meta .restricted { font-weight:bold; color:#cc3333; }
    .content { padding:15px 40px; }
    .content .log-title { font-size:11px; color:#1a237e; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px; }
    table.log { width:100%; border-collapse:collapse; font-size:10px; }
    table.log thead tr { background:#1a237e; color:#fff; font-size:9px; text-transform:uppercase; letter-spacing:1px; }
    table.log th { padding:6px 10px; text-align:left; }
    table.log td { padding:6px 10px; border-bottom:1px solid var(--color-primary)33; vertical-align:top; }
    table.log td.num { width:50px; color:#666; font-family:'Courier New',monospace; }
    table.log td.src { width:80px; color:#1a237e; font-weight:700; font-family:'Courier New',monospace; }
    table.log td.msg { color:#000; line-height:1.5; font-family:'Courier New',monospace; white-space:pre-wrap; word-break:break-word; }
    .footer { padding:10px 40px; border-top:2px solid #1a237e; font-size:8px; color:#999; text-align:center; }
    .footer p { margin:2px 0; }
    .footer .warn { color:#cc3333; font-weight:bold; margin-top:4px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="tricolor"></div>
  <div class="header">
    <div class="title">KARNATAKA STATE POLICE</div>
    <div class="sub">Crime Intelligence Portal</div>
    <div class="govt">भारत सरकार &bull; Government of Karnataka</div>
    <div class="gold-line"></div>
    <div class="seal">OFFICIAL CHAT TRANSCRIPT</div>
  </div>
  <div class="meta">
    <table>
      <tr><td class="label">Conversation Ref No.</td><td class="value" style="font-family:'Courier New',monospace;color:#1a237e;">${refNo}</td></tr>
      <tr><td class="label">Date of Transcript</td><td class="value">${dateStr}</td></tr>
      <tr><td class="label">Time of Export</td><td class="value">${timeStr} IST</td></tr>
      <tr><td class="label">User Role</td><td class="value" style="text-transform:uppercase;">${activeRole}</td></tr>
      <tr><td class="label">Total Exchanges</td><td class="value">${messages.length}</td></tr>
      <tr><td class="label">Classification</td><td class="restricted">RESTRICTED — FOR OFFICIAL USE ONLY</td></tr>
    </table>
  </div>
  <div class="content">
    <div class="log-title">&#9679; Intelligence Query Log</div>
    <table class="log">
      <thead><tr><th>#</th><th>Source</th><th>Message</th></tr></thead>
      <tbody>
        ${messages.map((msg, i) => `
          <tr>
            <td class="num">${String(i + 1).padStart(2, '0')}</td>
            <td class="src">${msg.from === 'user' ? 'OFFICER' : 'COP BOT'}</td>
            <td class="msg">${msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  <div class="footer">
    <p>This document is a computer-generated transcript of the KSP CopBot conversation.</p>
    <p>Unauthorized disclosure, copying, or distribution is prohibited under Section 66 of IT Act, 2000.</p>
    <p class="warn">RESTRICTED — FOR OFFICIAL USE ONLY</p>
  </div>
  <div class="tricolor"></div>
  <script>
    window.onload = function() { window.print(); };
    window.onafterprint = function() { window.close(); };
  </script>
</body>
</html>`);
      win.document.close();
    } else {
      alert('Popup blocked! Please allow popups for PDF export, or use Print (Ctrl+P) manually.');
      document.body.removeChild(element);
      return;
    }
    document.body.removeChild(element);
  };

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(msg, activeRole);
      setMessages(prev => [...prev, { from: 'bot', text: response }]);
      setLoading(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-sm bg-[var(--color-primary)] text-[var(--color-canvas-dark)] hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          title="KSP CopBot"
          aria-label="Open KSP CopBot chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[calc(100vh-6rem)] sm:h-[560px] max-h-[560px] card-dark flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated-dark)] shrink-0">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-sm bg-[var(--color-primary)]/10">
                <Bot className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[var(--color-on-dark)]">KSP CopBot</h3>
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">AI Intelligence Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={exportChat}
                className="p-1.5 rounded-sm hover:bg-[var(--color-surface-card-dark)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                title="Export Chat as PDF"
                aria-label="Export conversation transcript as PDF"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-sm hover:bg-[var(--color-surface-card-dark)] text-[var(--color-muted)] hover:text-[var(--color-on-dark)] transition-colors"
                aria-label="Close CopBot conversation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-[var(--color-canvas-dark)]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-1.5 rounded-sm shrink-0 ${msg.from === 'user' ? 'bg-[var(--color-primary)]/20' : 'bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)]'}`}>
                    {msg.from === 'user' ? <User className="h-3.5 w-3.5 text-[var(--color-primary)]" /> : <Bot className="h-3.5 w-3.5 text-[var(--color-primary)]" />}
                  </div>
                  <div className={`px-3 py-2 rounded-sm text-[12px] leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-on-dark)] border border-[var(--color-primary)]/20'
                      : 'bg-[var(--color-surface-elevated-dark)] text-[var(--color-muted)] border border-[var(--color-hairline-dark)]'
                  }`}>
                    {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i} className="text-[var(--color-primary)]">{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 max-w-[85%]">
                  <div className="p-1.5 rounded-sm bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)]">
                    <Bot className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  </div>
                  <div className="px-3 py-2 rounded-sm bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)]">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 p-3 border-t border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated-dark)]">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {suggestions.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-[10px] px-2 py-1 rounded-sm bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about crimes, offenders..."
                className="flex-1 bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] text-[var(--color-on-dark)] text-[12px] rounded-sm py-2 px-3 focus:outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-muted)]"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-sm bg-[var(--color-primary)] text-[var(--color-canvas-dark)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message to CopBot"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
