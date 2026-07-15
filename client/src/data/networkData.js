// ============================================================
// KSP Criminal Intelligence — Network Graph Data
// Node Types: offender | victim | policeStation | crime | bankAccount | phone
// Edge Types: committed | victimized | investigatedBy | coAccused | linkedTo | transferred | called
// ============================================================

// ── Police Stations ──────────────────────────────────────────
export const stationNodes = [
  { data: { id: 'ps-1', label: 'Shivajinagar PS',    type: 'policeStation', district: 'Bengaluru Urban', staff: 42, status: 'High Alert',   community: 0 } },
  { data: { id: 'ps-2', label: 'Indiranagar PS',     type: 'policeStation', district: 'Bengaluru Urban', staff: 38, status: 'Normal',       community: 0 } },
  { data: { id: 'ps-3', label: 'Halasuru PS',        type: 'policeStation', district: 'Bengaluru Urban', staff: 45, status: 'High Alert',   community: 0 } },
  { data: { id: 'ps-4', label: 'Devaraja PS',        type: 'policeStation', district: 'Mysuru',          staff: 35, status: 'Normal',       community: 1 } },
  { data: { id: 'ps-5', label: 'Lakshmipuram PS',   type: 'policeStation', district: 'Mysuru',          staff: 30, status: 'Normal',       community: 1 } },
  { data: { id: 'ps-6', label: 'Belagavi Town PS',  type: 'policeStation', district: 'Belagavi',        staff: 40, status: 'Normal',       community: 2 } },
  { data: { id: 'ps-7', label: 'Mangaluru South PS',type: 'policeStation', district: 'Dakshina Kannada',staff: 50, status: 'Med Alert',    community: 3 } },
  { data: { id: 'ps-8', label: 'Kalaburagi City PS',type: 'policeStation', district: 'Kalaburagi',      staff: 36, status: 'Normal',       community: 4 } },
];

// ── Repeat Offenders ─────────────────────────────────────────
export const offenderNodes = [
  { data: { id: 'off-1', label: 'Rajesh Choudhary',  type: 'offender', age: 30, riskScore: 92, caseCount: 11, mo: 'Phishing / Bank Fraud',    district: 'Bengaluru Urban', community: 0, expanded: false } },
  { data: { id: 'off-2', label: 'Imran Basappa',     type: 'offender', age: 29, riskScore: 84, caseCount: 8,  mo: 'Night Burglary',           district: 'Bengaluru Urban', community: 0, expanded: false } },
  { data: { id: 'off-3', label: 'Sneha Yellappa',    type: 'offender', age: 41, riskScore: 78, caseCount: 6,  mo: 'Matrimonial Fraud',        district: 'Mysuru',          community: 1, expanded: false } },
  { data: { id: 'off-4', label: 'Vikas Gupta',       type: 'offender', age: 35, riskScore: 65, caseCount: 5,  mo: 'Chain Snatching',          district: 'Belagavi',        community: 2, expanded: false } },
  { data: { id: 'off-5', label: 'Anil Deshpande',    type: 'offender', age: 38, riskScore: 49, caseCount: 4,  mo: 'Vehicle Theft',            district: 'Dakshina Kannada',community: 3, expanded: false } },
  { data: { id: 'off-6', label: 'Siddappa Naik',     type: 'offender', age: 33, riskScore: 71, caseCount: 7,  mo: 'Narcotics Distribution',   district: 'Dakshina Kannada',community: 3, expanded: false } },
  { data: { id: 'off-7', label: 'Priya Hegde',       type: 'offender', age: 27, riskScore: 55, caseCount: 5,  mo: 'Identity Theft',           district: 'Kalaburagi',      community: 4, expanded: false } },
];

// ── Victims ──────────────────────────────────────────────────
export const victimNodes = [
  { data: { id: 'vic-1',  label: 'Ananya Sharma',    type: 'victim', age: 52, victimOf: 'Online Financial Fraud', community: 0 } },
  { data: { id: 'vic-2',  label: 'Ravi Bhat',        type: 'victim', age: 44, victimOf: 'Burglary by Night',      community: 0 } },
  { data: { id: 'vic-3',  label: 'Kavitha Murthy',   type: 'victim', age: 38, victimOf: 'Chain Snatching',        community: 0 } },
  { data: { id: 'vic-4',  label: 'Sanjay Patil',     type: 'victim', age: 61, victimOf: 'Online Financial Fraud', community: 0 } },
  { data: { id: 'vic-5',  label: 'Deepa Nair',       type: 'victim', age: 35, victimOf: 'Matrimonial Fraud',      community: 1 } },
  { data: { id: 'vic-6',  label: 'Ramesh Gowda',     type: 'victim', age: 48, victimOf: 'Vehicle Theft',          community: 1 } },
  { data: { id: 'vic-7',  label: 'Sunita Desai',     type: 'victim', age: 55, victimOf: 'Matrimonial Fraud',      community: 1 } },
  { data: { id: 'vic-8',  label: 'Ashok Kumar',      type: 'victim', age: 40, victimOf: 'House Theft',            community: 2 } },
  { data: { id: 'vic-9',  label: 'Leela Rao',        type: 'victim', age: 67, victimOf: 'Chain Snatching',        community: 2 } },
  { data: { id: 'vic-10', label: 'Mohan Das',        type: 'victim', age: 29, victimOf: 'Assault',                community: 3 } },
  { data: { id: 'vic-11', label: 'Fatima Sheikh',    type: 'victim', age: 33, victimOf: 'Identity Theft',         community: 4 } },
  { data: { id: 'vic-12', label: 'Girish Kamath',    type: 'victim', age: 51, victimOf: 'Narcotics Victim',       community: 3 } },
];

// ── Crime Event Nodes ─────────────────────────────────────────
export const crimeNodes = [
  // Community 0 — Bengaluru Urban Cluster
  { data: { id: 'cr-1',  label: 'FIR #100412026001', type: 'crime', head: 'Cyber Crime',        sub: 'Online Financial Fraud',    date: '2026-05-12', status: 'Under Investigation', gravity: '2', community: 0 } },
  { data: { id: 'cr-2',  label: 'FIR #100412026002', type: 'crime', head: 'Property Offences',  sub: 'Burglary by Night',         date: '2026-04-28', status: 'Chargesheeted',        gravity: '1', community: 0 } },
  { data: { id: 'cr-3',  label: 'FIR #100412026003', type: 'crime', head: 'Property Offences',  sub: 'Chain Snatching',           date: '2026-06-01', status: 'Under Investigation', gravity: '1', community: 0 } },
  { data: { id: 'cr-4',  label: 'FIR #100412026004', type: 'crime', head: 'Cyber Crime',        sub: 'Phishing / OTP Fraud',      date: '2026-03-15', status: 'Disposed',             gravity: '2', community: 0 } },
  { data: { id: 'cr-5',  label: 'FIR #100412026005', type: 'crime', head: 'Property Offences',  sub: 'House Theft',               date: '2026-05-20', status: 'Chargesheeted',        gravity: '1', community: 0 } },
  { data: { id: 'cr-6',  label: 'FIR #100412026006', type: 'crime', head: 'Cyber Crime',        sub: 'Identity Theft',            date: '2026-06-10', status: 'Under Investigation', gravity: '2', community: 0 } },
  // Community 1 — Mysuru Cluster
  { data: { id: 'cr-7',  label: 'FIR #100422026007', type: 'crime', head: 'Cyber Crime',        sub: 'Matrimonial Fraud',         date: '2026-02-14', status: 'Under Investigation', gravity: '2', community: 1 } },
  { data: { id: 'cr-8',  label: 'FIR #100422026008', type: 'crime', head: 'Property Offences',  sub: 'Vehicle Theft',             date: '2026-04-05', status: 'Chargesheeted',        gravity: '2', community: 1 } },
  { data: { id: 'cr-9',  label: 'FIR #100422026009', type: 'crime', head: 'Cyber Crime',        sub: 'Online Obscenity',          date: '2026-01-22', status: 'Disposed',             gravity: '2', community: 1 } },
  // Community 2 — Belagavi Cluster
  { data: { id: 'cr-10', label: 'FIR #100432026010', type: 'crime', head: 'Crimes Against Body',sub: 'Chain Snatching',           date: '2026-05-30', status: 'Under Investigation', gravity: '1', community: 2 } },
  { data: { id: 'cr-11', label: 'FIR #100432026011', type: 'crime', head: 'Property Offences',  sub: 'House Theft',               date: '2026-06-14', status: 'Chargesheeted',        gravity: '1', community: 2 } },
  // Community 3 — Dakshina Kannada Cluster
  { data: { id: 'cr-12', label: 'FIR #100442026012', type: 'crime', head: 'Narcotics NDPS',     sub: 'Cannabis/Ganja Possession', date: '2026-03-08', status: 'Chargesheeted',        gravity: '1', community: 3 } },
  { data: { id: 'cr-13', label: 'FIR #100442026013', type: 'crime', head: 'Crimes Against Body',sub: 'Assault',                   date: '2026-04-19', status: 'Under Investigation', gravity: '1', community: 3 } },
  { data: { id: 'cr-14', label: 'FIR #100442026014', type: 'crime', head: 'Narcotics NDPS',     sub: 'Synthetic Drug Sale',       date: '2026-06-22', status: 'Under Investigation', gravity: '1', community: 3 } },
  // Community 4 — Kalaburagi Cluster
  { data: { id: 'cr-15', label: 'FIR #100452026015', type: 'crime', head: 'Cyber Crime',        sub: 'Identity Theft',            date: '2026-05-05', status: 'Under Investigation', gravity: '2', community: 4 } },
  { data: { id: 'cr-16', label: 'FIR #100452026016', type: 'crime', head: 'Property Offences',  sub: 'Vehicle Theft',             date: '2026-06-18', status: 'Chargesheeted',        gravity: '2', community: 4 } },
];

// ── Financial Nodes ───────────────────────────────────────────
export const financialNodes = [
  { data: { id: 'fin-1', label: 'HDFC Acct ****3821', type: 'bankAccount', bank: 'HDFC', balance: '₹4.2L', community: 0 } },
  { data: { id: 'fin-2', label: 'SBI Acct ****9932', type: 'bankAccount', bank: 'SBI', balance: '₹12.5L', community: 0 } },
  { data: { id: 'fin-3', label: 'Crypto Wallet 0x8a', type: 'bankAccount', bank: 'Binance', balance: '2.4 BTC', community: 0 } },
];

// ── Telecom Nodes ─────────────────────────────────────────────
export const telecomNodes = [
  { data: { id: 'tel-1', label: '+91-9876543210', type: 'phone', carrier: 'Jio', imei: 'IMEI-987', community: 0 } },
  { data: { id: 'tel-2', label: '+91-9123456789', type: 'phone', carrier: 'Airtel', imei: 'IMEI-123', community: 0 } },
];

// ── Edges ─────────────────────────────────────────────────────
export const edges = [
  // --- Offender → Crime (committed) ---
  { data: { id: 'e-o1-c1',  source: 'off-1', target: 'cr-1',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o1-c4',  source: 'off-1', target: 'cr-4',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o1-c6',  source: 'off-1', target: 'cr-6',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o2-c2',  source: 'off-2', target: 'cr-2',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o2-c3',  source: 'off-2', target: 'cr-3',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o2-c5',  source: 'off-2', target: 'cr-5',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o3-c7',  source: 'off-3', target: 'cr-7',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o3-c9',  source: 'off-3', target: 'cr-9',  type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o4-c10', source: 'off-4', target: 'cr-10', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o4-c11', source: 'off-4', target: 'cr-11', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o5-c12', source: 'off-5', target: 'cr-12', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o5-c13', source: 'off-5', target: 'cr-13', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o6-c12', source: 'off-6', target: 'cr-12', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o6-c14', source: 'off-6', target: 'cr-14', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o7-c15', source: 'off-7', target: 'cr-15', type: 'committed', label: 'Committed' } },
  { data: { id: 'e-o7-c16', source: 'off-7', target: 'cr-16', type: 'committed', label: 'Committed' } },

  // --- Co-Accused (offender ↔ offender sharing same crime) ---
  { data: { id: 'e-co-1-2',  source: 'off-1', target: 'off-2', type: 'coAccused', label: 'Co-Accused' } },
  { data: { id: 'e-co-5-6',  source: 'off-5', target: 'off-6', type: 'coAccused', label: 'Co-Accused' } },
  { data: { id: 'e-co-3-4',  source: 'off-3', target: 'off-4', type: 'coAccused', label: 'Linked Suspect' } },

  // --- Crime → Victim (victimized) ---
  { data: { id: 'e-c1-v1',   source: 'cr-1',  target: 'vic-1',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c1-v4',   source: 'cr-1',  target: 'vic-4',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c2-v2',   source: 'cr-2',  target: 'vic-2',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c3-v3',   source: 'cr-3',  target: 'vic-3',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c5-v8',   source: 'cr-5',  target: 'vic-8',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c7-v5',   source: 'cr-7',  target: 'vic-5',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c7-v7',   source: 'cr-7',  target: 'vic-7',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c8-v6',   source: 'cr-8',  target: 'vic-6',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c10-v9',  source: 'cr-10', target: 'vic-9',  type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c13-v10', source: 'cr-13', target: 'vic-10', type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c14-v12', source: 'cr-14', target: 'vic-12', type: 'victimized', label: 'Victimized' } },
  { data: { id: 'e-c15-v11', source: 'cr-15', target: 'vic-11', type: 'victimized', label: 'Victimized' } },

  // --- Crime → Police Station (investigatedBy) ---
  { data: { id: 'e-c1-ps1',  source: 'cr-1',  target: 'ps-1', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c2-ps2',  source: 'cr-2',  target: 'ps-2', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c3-ps1',  source: 'cr-3',  target: 'ps-1', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c4-ps3',  source: 'cr-4',  target: 'ps-3', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c5-ps2',  source: 'cr-5',  target: 'ps-2', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c6-ps3',  source: 'cr-6',  target: 'ps-3', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c7-ps4',  source: 'cr-7',  target: 'ps-4', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c8-ps5',  source: 'cr-8',  target: 'ps-5', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c9-ps4',  source: 'cr-9',  target: 'ps-4', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c10-ps6', source: 'cr-10', target: 'ps-6', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c11-ps6', source: 'cr-11', target: 'ps-6', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c12-ps7', source: 'cr-12', target: 'ps-7', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c13-ps7', source: 'cr-13', target: 'ps-7', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c14-ps7', source: 'cr-14', target: 'ps-7', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c15-ps8', source: 'cr-15', target: 'ps-8', type: 'investigatedBy', label: 'Investigated By' } },
  { data: { id: 'e-c16-ps8', source: 'cr-16', target: 'ps-8', type: 'investigatedBy', label: 'Investigated By' } },

  // --- Cross-community Intel Links ---
  { data: { id: 'e-intel-1', source: 'off-1', target: 'off-7', type: 'linkedTo', label: 'Intelligence Link' } },
  { data: { id: 'e-intel-2', source: 'off-3', target: 'off-7', type: 'linkedTo', label: 'Intelligence Link' } },
  { data: { id: 'e-intel-3', source: 'cr-6',  target: 'cr-15', type: 'linkedTo', label: 'MO Match' } },

  // --- Financial Links ---
  { data: { id: 'e-fin-1', source: 'off-1', target: 'fin-1', type: 'transferred', label: 'Account Holder' } },
  { data: { id: 'e-fin-2', source: 'vic-1', target: 'fin-1', type: 'transferred', label: 'Fraud Transfer' } },
  { data: { id: 'e-fin-3', source: 'fin-1', target: 'fin-3', type: 'transferred', label: 'Laundered' } },
  { data: { id: 'e-fin-4', source: 'off-2', target: 'fin-2', type: 'transferred', label: 'Account Holder' } },

  // --- Telecom Links ---
  { data: { id: 'e-tel-1', source: 'off-1', target: 'tel-1', type: 'linkedTo', label: 'Registered To' } },
  { data: { id: 'e-tel-2', source: 'off-2', target: 'tel-2', type: 'linkedTo', label: 'Registered To' } },
  { data: { id: 'e-tel-3', source: 'tel-1', target: 'tel-2', type: 'called', label: 'High Frequency Calls' } },
];

// ── Community Metadata ──────────────────────────────────────
export const communities = [
  { id: 0, name: 'Bengaluru Urban Network', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.05)' },
  { id: 1, name: 'Mysuru Syndicate',        color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.05)' },
  { id: 2, name: 'Belagavi Ring',           color: '#f59e0b', bgColor: 'rgba(245,158,11,0.05)' },
  { id: 3, name: 'Coastal Crime Network',   color: '#10b981', bgColor: 'rgba(16,185,129,0.05)' },
  { id: 4, name: 'North Karnataka Cell',    color: '#ec4899', bgColor: 'rgba(236,72,153,0.05)' },
];

// ── Hidden Neighbor Nodes (for expand feature) ──────────────
// These appear only after clicking a node to expand
export const hiddenNeighborNodes = [
  // Rajesh Choudhary's known associates (hidden initially)
  { data: { id: 'off-1h-1', label: 'Deepak Iyer',      type: 'offender', age: 31, riskScore: 44, caseCount: 3, mo: 'OTP Fraud Support', district: 'Bengaluru Urban', community: 0, hidden: true, parentOffender: 'off-1' } },
  { data: { id: 'off-1h-2', label: 'Meena Suresh',     type: 'offender', age: 26, riskScore: 38, caseCount: 2, mo: 'Mule Account Operator', district: 'Bengaluru Urban', community: 0, hidden: true, parentOffender: 'off-1' } },
  // Imran Basappa's known associates
  { data: { id: 'off-2h-1', label: 'Salim Khan',       type: 'offender', age: 34, riskScore: 57, caseCount: 4, mo: 'Lookout / Accomplice', district: 'Bengaluru Urban', community: 0, hidden: true, parentOffender: 'off-2' } },
  // Siddappa Naik's network
  { data: { id: 'off-6h-1', label: 'Ramu Gouda',       type: 'offender', age: 22, riskScore: 31, caseCount: 2, mo: 'Street Distribution', district: 'Dakshina Kannada', community: 3, hidden: true, parentOffender: 'off-6' } },
  { data: { id: 'off-6h-2', label: 'Jayesh Nayak',     type: 'offender', age: 29, riskScore: 45, caseCount: 3, mo: 'Supply Chain Logistics', district: 'Dakshina Kannada', community: 3, hidden: true, parentOffender: 'off-6' } },
  // Crime scene witnesses / anonymous sources (as victims)
  { data: { id: 'vic-h-1',  label: 'Anonymous Victim A', type: 'victim', age: null, victimOf: 'Phishing', community: 0, hidden: true, parentOffender: 'off-1' } },
  { data: { id: 'vic-h-2',  label: 'Anonymous Victim B', type: 'victim', age: null, victimOf: 'Burglary', community: 0, hidden: true, parentOffender: 'off-2' } },
];

export const hiddenNeighborEdges = [
  { data: { id: 'e-h-o1-o1h1', source: 'off-1',   target: 'off-1h-1', type: 'coAccused', label: 'Known Associate', hidden: true, parentOffender: 'off-1' } },
  { data: { id: 'e-h-o1-o1h2', source: 'off-1',   target: 'off-1h-2', type: 'coAccused', label: 'Known Associate', hidden: true, parentOffender: 'off-1' } },
  { data: { id: 'e-h-o1-vh1',  source: 'off-1',   target: 'vic-h-1',  type: 'victimized', label: 'Victimized', hidden: true, parentOffender: 'off-1' } },
  { data: { id: 'e-h-o2-o2h1', source: 'off-2',   target: 'off-2h-1', type: 'coAccused', label: 'Known Associate', hidden: true, parentOffender: 'off-2' } },
  { data: { id: 'e-h-o2-vh2',  source: 'off-2',   target: 'vic-h-2',  type: 'victimized', label: 'Victimized', hidden: true, parentOffender: 'off-2' } },
  { data: { id: 'e-h-o6-o6h1', source: 'off-6',   target: 'off-6h-1', type: 'coAccused', label: 'Known Associate', hidden: true, parentOffender: 'off-6' } },
  { data: { id: 'e-h-o6-o6h2', source: 'off-6',   target: 'off-6h-2', type: 'coAccused', label: 'Known Associate', hidden: true, parentOffender: 'off-6' } },
];

// ── Full Node/Edge Set (initial — hidden nodes excluded) ────
export const initialElements = [
  ...stationNodes,
  ...offenderNodes,
  ...victimNodes,
  ...crimeNodes,
  ...financialNodes,
  ...telecomNodes,
  ...edges,
];

export const allNodes = [
  ...stationNodes,
  ...offenderNodes,
  ...victimNodes,
  ...crimeNodes,
  ...financialNodes,
  ...telecomNodes,
  ...hiddenNeighborNodes,
];

export const allEdges = [
  ...edges,
  ...hiddenNeighborEdges,
];
