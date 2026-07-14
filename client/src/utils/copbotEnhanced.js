/**
 * Enhanced CopBot response generation with live ML predictions
 */
import { fetchWithFallback, MOCK_OUTCOMES, MOCK_FORECASTS, MOCK_ANOMALIES, MOCK_CLUSTERS, MOCK_TYPOLOGIES } from './mockApi';

export async function generateEnhancedResponse(query, activeRole) {
  const q = query.toLowerCase();
  let baseResponse = generateBaseResponse(query, activeRole);

  // Enhance with ML predictions for relevant queries
  if (q.includes('risk') || q.includes('predict') || q.includes('outcome')) {
    try {
      const predictions = await fetchPredictions('caseOutcome', 10);
      if (predictions.length > 0) {
        const highConfidence = predictions.filter(p => p.chargesheetProbability > 70);
        baseResponse += `\n\n📊 **ML Predictions - Chargesheet Likelihood:**\n`;
        highConfidence.slice(0, 3).forEach(p => {
          baseResponse += `• ${p.caseNo}: ${p.predictedOutcome} (${p.chargesheetProbability}% confidence)\n`;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch predictions:', err);
    }
  }

  if (q.includes('trend') || q.includes('forecast') || q.includes('future')) {
    try {
      const forecasts = await fetchForecasts();
      if (forecasts.length > 0) {
        baseResponse += `\n\n📈 **Predictive Forecasts:**\n`;
        forecasts.slice(0, 2).forEach(f => {
          baseResponse += `• ${f.district}: ${f.trendDirection} trend, peak at ${f.peakWeek} (avg ${f.currentAvg} cases/week)\n`;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch forecasts:', err);
    }
  }

  if (q.includes('anomal') || q.includes('unusual') || q.includes('spike')) {
    try {
      const anomalies = await fetchAnomalies();
      if (anomalies.length > 0) {
        const criticalAnomalies = anomalies.filter(a => a.isAnomaly);
        baseResponse += `\n\n🚨 **Detected Anomalies:**\n`;
        criticalAnomalies.slice(0, 3).forEach(a => {
          baseResponse += `• ${a.caseNo}: ${a.anomalyType} (score: ${a.anomalyScore})\n`;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch anomalies:', err);
    }
  }

  if (q.includes('behavior') || q.includes('profile') || q.includes('offender type')) {
    try {
      const clusters = await fetchClusters();
      if (clusters.typologies && clusters.typologies.length > 0) {
        baseResponse += `\n\n👥 **Offender Typologies:**\n`;
        clusters.summary.forEach(s => {
          baseResponse += `• ${s.typology}: ${s.count} offenders (${s.percentage}%)\n`;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch clusters:', err);
    }
  }

  return baseResponse;
}

async function fetchPredictions(type, limit) {
  const data = await fetchWithFallback(`/predictions?type=${type}&limit=${limit}`);
  return data?.caseOutcomes || MOCK_OUTCOMES;
}

async function fetchForecasts() {
  const data = await fetchWithFallback(`/predictions?type=trend&limit=5`);
  return data?.forecasts || MOCK_FORECASTS;
}

async function fetchAnomalies() {
  const data = await fetchWithFallback(`/predictions?type=anomaly&limit=10`);
  return data?.anomalies || MOCK_ANOMALIES;
}

async function fetchClusters() {
  const data = await fetchWithFallback(`/clustering?type=offender`);
  return data || { clusters: MOCK_CLUSTERS, typologies: MOCK_TYPOLOGIES, summary: MOCK_TYPOLOGIES.map((t, i) => ({ typology: t.typology, count: t.memberCount, percentage: ((t.memberCount / MOCK_CLUSTERS.reduce((s, c) => s + c.size, 0)) * 100).toFixed(1) })) };
}

function generateBaseResponse(query, activeRole) {
  const q = query.toLowerCase();
  const crimeData = {
    crimes: [
      { crimeNo: '10041202600001', type: 'Property Offences', sub: 'Burglary by Night', ps: 'Shivajinagar PS', district: 'Bengaluru Urban', status: 'Under Investigation', date: '2026-07-01', gravity: 'Heinous' },
      { crimeNo: '10041202600002', type: 'Cyber Crimes', sub: 'Online Financial Fraud', ps: 'Indiranagar PS', district: 'Bengaluru Urban', status: 'Chargesheeted', date: '2026-06-29', gravity: 'Non-Heinous' },
    ],
    offenders: [
      { name: 'Rajesh Choudhary', risk: 92, cases: 11, districts: 3, mo: 'posed as bank official' },
      { name: 'Imran Basappa', risk: 84, cases: 8, districts: 2, mo: 'gained entry through rear window' },
    ]
  };

  if (q.includes('hello') || q.includes('hi')) {
    return `नमस्ते! I am **KSP CopBot** with AI-powered predictive insights. Ask about crimes, predictions, or anomalies.`;
  }

  if (q.includes('crime') || q.includes('fir')) {
    return `📋 **FIR Database Query:**\n${crimeData.crimes.map(x => `• ${x.crimeNo} — ${x.sub} (${x.status})`).join('\n')}`;
  }

  if (q.includes('offender') || q.includes('criminal')) {
    return `👤 **Tracked Offenders:**\n${crimeData.offenders.map(x => `• ${x.name} — Risk ${x.risk}%, ${x.cases} cases`).join('\n')}`;
  }

  return `I can help with crime data, predictions, forecasts, anomalies, and offender analysis. What would you like to know?`;
}
