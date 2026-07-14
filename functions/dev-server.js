const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/predictions', (req, res) => {
  const type = req.query.type || 'all';
  const results = {};

  if (type === 'caseOutcome' || type === 'all') {
    results.caseOutcomes = [
      { caseId: '1', caseNo: '10041202600001', crimeHead: 'Property Offences', predictedOutcome: 'DETECTED', chargesheetProbability: 82.5, confidence: 78.0, accusedCount: 2, hasArrest: true, registrationDate: '2026-07-01' },
      { caseId: '2', caseNo: '10041202600002', crimeHead: 'Cyber Crimes', predictedOutcome: 'UNDETECTED', chargesheetProbability: 45.0, confidence: 55.0, accusedCount: 1, hasArrest: false, registrationDate: '2026-06-29' },
      { caseId: '3', caseNo: '10042202600003', crimeHead: 'Crimes Against Body', predictedOutcome: 'DETECTED', chargesheetProbability: 90.0, confidence: 92.0, accusedCount: 3, hasArrest: true, registrationDate: '2026-06-28' },
      { caseId: '4', caseNo: '10043202600004', crimeHead: 'Property Offences', predictedOutcome: 'DETECTED', chargesheetProbability: 71.2, confidence: 65.0, accusedCount: 1, hasArrest: true, registrationDate: '2026-06-25' },
      { caseId: '5', caseNo: '10044202600005', crimeHead: 'Narcotics NDPS', predictedOutcome: 'UNDETECTED', chargesheetProbability: 52.0, confidence: 48.0, accusedCount: 4, hasArrest: false, registrationDate: '2026-06-20' },
      { caseId: '6', caseNo: '10045202600006', crimeHead: 'Cyber Crimes', predictedOutcome: 'FALSE', chargesheetProbability: 22.0, confidence: 38.0, accusedCount: 1, hasArrest: false, registrationDate: '2026-06-18' },
      { caseId: '7', caseNo: '10046202600007', crimeHead: 'Property Offences', predictedOutcome: 'DETECTED', chargesheetProbability: 68.0, confidence: 60.0, accusedCount: 2, hasArrest: true, registrationDate: '2026-06-15' },
      { caseId: '8', caseNo: '10041202600008', crimeHead: 'Property Offences', predictedOutcome: 'UNDETECTED', chargesheetProbability: 38.5, confidence: 45.0, accusedCount: 1, hasArrest: false, registrationDate: '2026-06-12' },
    ];
  }

  if (type === 'trend' || type === 'all') {
    const districts = ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dakshina Kannada', 'Kalaburagi'];
    results.forecasts = districts.map((district, di) => {
      const avgCount = 15 - di * 2;
      const forecast = [];
      for (let i = 1; i <= 12; i++) {
        const d = new Date('2026-07-14');
        d.setDate(d.getDate() + i * 7);
        const variance = Math.round(Math.random() * avgCount * 0.3);
        const trend = i > 6 ? 1.1 : 0.95;
        const yhat = Math.max(1, Math.round(avgCount * trend + variance));
        forecast.push({ ds: d.toISOString().split('T')[0], yhat, yhat_lower: Math.max(1, yhat - 5), yhat_upper: yhat + 5 });
      }
      const slope = forecast[forecast.length - 1].yhat - forecast[0].yhat;
      const trendDirection = Math.abs(slope) < 2 ? 'STABLE' : slope > 0 ? 'INCREASING' : 'DECREASING';
      return {
        district,
        districtId: di + 1,
        currentAvg: avgCount,
        forecast,
        trendDirection,
        peakWeek: forecast.reduce((max, f) => f.yhat > max.yhat ? f : max).ds
      };
    });
  }

  if (type === 'anomaly' || type === 'all') {
    results.anomalies = [
      { caseId: '101', caseNo: '10041202600001', crimeHead: 'Property Offences', crimeSubHead: 'Burglary by Night', anomalyScore: 78.5, isAnomaly: true, anomalyType: 'volume', spikeRatio: 2.3, casesInWeek: 12 },
      { caseId: '105', caseNo: '10044202600005', crimeHead: 'Narcotics NDPS', crimeSubHead: 'Cannabis/Ganja Possession', anomalyScore: 65.0, isAnomaly: true, anomalyType: 'spatial', spikeRatio: 1.8, casesInWeek: 8 },
      { caseId: '102', caseNo: '10041202600002', crimeHead: 'Cyber Crimes', crimeSubHead: 'Online Financial Fraud', anomalyScore: 32.0, isAnomaly: false, anomalyType: 'behavioral', spikeRatio: 1.1, casesInWeek: 5 },
    ];
  }

  res.json(results);
});

app.post('/alerts', (req, res) => {
  res.json({ success: true, message: 'Alert acknowledged', alertId: req.body.alertId });
});

app.get('/alerts', (req, res) => {
  res.json({
    alerts: [
      { alertId: 'ALERT_1_0', caseId: '1', caseNo: '10041202600001', district: 'Bengaluru Urban', unit: 'Shivajinagar PS', crimeHead: 'Property Offences', crimeSubHead: 'Burglary by Night', type: 'delayed', severity: 'critical', message: 'Case pending for 145 days (high severity crime, no chargesheet)', daysOpen: 145, accusedCount: 3, arrestCount: 1, timestamp: '2026-03-01', acknowledged: false, signalsSent: true },
      { alertId: 'ALERT_2_1', caseId: '2', caseNo: '10041202600002', district: 'Mysuru', unit: 'Devaraja PS', crimeHead: 'Cyber Crimes', crimeSubHead: 'Online Financial Fraud', type: 'network', severity: 'high', message: 'Network alert: 5 accused, only 2 arrested - possible organized crime', daysOpen: 45, accusedCount: 5, arrestCount: 2, timestamp: '2026-05-30', acknowledged: false, signalsSent: true },
      { alertId: 'ALERT_3_2', caseId: '3', caseNo: '10042202600003', district: 'Belagavi', unit: 'Belagavi Town PS', crimeHead: 'Crimes Against Body', crimeSubHead: 'Murder for Gain', type: 'disposition', severity: 'medium', message: 'Delayed chargesheet filing (70 days open)', daysOpen: 70, accusedCount: 2, arrestCount: 2, timestamp: '2026-04-15', acknowledged: false, signalsSent: false },
      { alertId: 'ALERT_4_3', caseId: '4', caseNo: '10043202600004', district: 'Dakshina Kannada', unit: 'Mangaluru South PS', crimeHead: 'Property Offences', crimeSubHead: 'Vehicle Theft', type: 'volume', severity: 'medium', message: 'Multiple accused (6) - coordination required', daysOpen: 30, accusedCount: 6, arrestCount: 3, timestamp: '2026-06-14', acknowledged: false, signalsSent: false },
      { alertId: 'ALERT_5_4', caseId: '5', caseNo: '10044202600005', district: 'Kalaburagi', unit: 'Kalaburagi City PS', crimeHead: 'Narcotics NDPS', crimeSubHead: 'Cannabis/Ganja Possession', type: 'arrest', severity: 'low', message: 'No arrest yet after 35 days - escalate investigation', daysOpen: 35, accusedCount: 1, arrestCount: 0, timestamp: '2026-06-09', acknowledged: false, signalsSent: false },
    ],
    count: 5,
    critical: 1,
    high: 1
  });
});

app.get('/clustering', (req, res) => {
  const clusters = [
    {
      id: 0, size: 12,
      centroid: { frequency: 0.85, mobility: 0.3, severity: 0.75, evasion: 0.4, specialization: 0.2 },
      members: [
        { id: '1', name: 'Rajesh Choudhary', frequency: 0.9, mobility: 0.3, severity: 0.8, evasion: 0.3, specialization: 0.2, rawData: { caseCount: 11 } },
        { id: '2', name: 'Imran Basappa', frequency: 0.8, mobility: 0.4, severity: 0.7, evasion: 0.5, specialization: 0.3, rawData: { caseCount: 8 } },
      ]
    },
    {
      id: 1, size: 8,
      centroid: { frequency: 0.7, mobility: 0.25, severity: 0.4, evasion: 0.6, specialization: 0.8 },
      members: [
        { id: '3', name: 'Sneha Yellappa', frequency: 0.7, mobility: 0.3, severity: 0.4, evasion: 0.6, specialization: 0.8, rawData: { caseCount: 6 } },
      ]
    },
    {
      id: 2, size: 6,
      centroid: { frequency: 0.5, mobility: 0.6, severity: 0.5, evasion: 0.5, specialization: 0.5 },
      members: [
        { id: '4', name: 'Vikas Gupta', frequency: 0.5, mobility: 0.6, severity: 0.5, evasion: 0.5, specialization: 0.5, rawData: { caseCount: 5 } },
      ]
    },
    {
      id: 3, size: 4,
      centroid: { frequency: 0.4, mobility: 0.7, severity: 0.3, evasion: 0.7, specialization: 0.4 },
      members: [
        { id: '5', name: 'Anil Deshpande', frequency: 0.4, mobility: 0.7, severity: 0.3, evasion: 0.7, specialization: 0.4, rawData: { caseCount: 4 } },
      ]
    },
  ];

  const typologies = [
    { clusterIdx: 0, typology: 'Organized Network', icon: '', color: '#cc3333', description: 'Coordinated multi-crime syndicate', memberCount: 12, characteristics: { avgFrequency: '85', avgSeverity: '75', avgMobility: '30', avgSpecialization: '20' } },
    { clusterIdx: 1, typology: 'Specialized Professional', icon: '', color: '#3399ff', description: 'Focused expertise in specific crime type', memberCount: 8, characteristics: { avgFrequency: '70', avgSeverity: '40', avgMobility: '25', avgSpecialization: '80' } },
    { clusterIdx: 2, typology: 'Repeat Street Offender', icon: '', color: '#ff9933', description: 'Frequent low-level recurring crimes', memberCount: 6, characteristics: { avgFrequency: '50', avgSeverity: '50', avgMobility: '60', avgSpecialization: '50' } },
    { clusterIdx: 3, typology: 'Wandering Opportunist', icon: '', color: '#66cc33', description: 'Mobile offender across districts', memberCount: 4, characteristics: { avgFrequency: '40', avgSeverity: '30', avgMobility: '70', avgSpecialization: '40' } },
  ];

  const total = clusters.reduce((s, c) => s + c.size, 0);

  res.json({
    clusters,
    typologies,
    offenderCount: total,
    summary: typologies.map(t => ({ typology: t.typology, count: t.memberCount, percentage: ((t.memberCount / total) * 100).toFixed(1) }))
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[dev-server] Mock API running on http://localhost:${PORT}`);
  console.log(`[dev-server] Endpoints: /predictions, /alerts, /clustering`);
});
