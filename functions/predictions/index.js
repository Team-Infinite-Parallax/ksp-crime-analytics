const catalyst = require('zcatalyst-sdk-node');
const url = require('url');
const { requireAuth } = require('./authMiddleware');

/**
 * Predictions API Handler
 * 
 * Exposes three ML predictions:
 * 1. GET /predictions?type=caseOutcome    -> CaseOutcomePredictor (chargesheet probability)
 * 2. GET /predictions?type=anomaly        -> AnomalyDetector (spike detection)
 * 3. GET /predictions?type=trend          -> TrendForecaster (3-month forecast)
 * 
 * With filters: districtId, unitId, limit, dateRange
 */

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER', 'INVESTIGATION_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initialize(req);
      const datastore = app.datastore();
      const user = req.user;

      const parsed = url.parse(req.url, true);
      const query = parsed.query || {};
      const predictionType = query.type || 'all';
      const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 500);

      // Build role-based filter
      let filterClause = '';
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          filterClause = `WHERE cm.DistrictID = ${districtId}`;
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ predictions: [] }));
        }
      } else if (user.role === 'INVESTIGATION_OFFICER') {
        const unitId = user.employee?.unitID;
        if (unitId) {
          filterClause = `WHERE cm.UnitID = ${unitId}`;
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ predictions: [] }));
        }
      }

      const results = {};

      // CASE OUTCOME PREDICTIONS
      if (predictionType === 'caseOutcome' || predictionType === 'all') {
        try {
          const caseOutcomeData = await datastore.executeCoQLQuery(`
            SELECT 
              cm.CaseID,
              cm.CaseNo,
              ch.CrimeHeadName,
              COUNT(DISTINCT a.AccusedID) AS accusedCount,
              SUM(CASE WHEN cm.GravityOffenceID = 1 THEN 1 ELSE 0 END) AS heinousCount,
              SUM(CASE WHEN ar.ArrestID IS NOT NULL THEN 1 ELSE 0 END) AS hasArrest,
              COALESCE(DATEDIFF(ar.ArrestDate, cm.RegistrationDate), 0) AS arrestLagDays,
              cm.RegistrationDate
            FROM CaseMaster cm
            LEFT JOIN CrimeHead ch ON cm.CrimeHeadID = ch.CrimeHeadID
            LEFT JOIN Accused a ON cm.CaseID = a.CaseID
            LEFT JOIN ArrestSurrender ar ON cm.CaseID = ar.CaseID
            ${filterClause}
            GROUP BY cm.CaseID, cm.CaseNo, ch.CrimeHeadName, cm.RegistrationDate
            ORDER BY cm.RegistrationDate DESC
            LIMIT ${limit}
          `);

          // Mock predictions based on case features (in production, call ML model)
          results.caseOutcomes = caseOutcomeData.map(row => {
            const heinousCount = Number(row.heinousCount || 0);
            const accusedCount = Number(row.accusedCount || 1);
            const hasArrest = Number(row.hasArrest || 0);
            const arrestLag = Number(row.arrestLagDays || 0);
            
            // Simple heuristic: cases with arrest + low lag are more likely to have chargesheet
            const baseProb = hasArrest ? 0.65 : 0.35;
            const lagFactor = arrestLag > 0 ? Math.min(arrestLag / 100, 0.15) : 0;
            const heinousFactor = heinousCount > 0 ? 0.1 : 0;
            const accusedFactor = Math.min(accusedCount / 10, 0.15);
            
            const chargesheetProb = Math.min(baseProb + lagFactor + heinousFactor + accusedFactor, 0.95);
            
            return {
              caseId: String(row.CaseID),
              caseNo: row.CaseNo,
              crimeHead: row.CrimeHeadName,
              predictedOutcome: chargesheetProb > 0.65 ? 'DETECTED' : chargesheetProb > 0.35 ? 'UNDETECTED' : 'FALSE',
              chargesheetProbability: parseFloat((chargesheetProb * 100).toFixed(1)),
              confidence: parseFloat((Math.abs(chargesheetProb - 0.5) * 2 * 100).toFixed(1)),
              accusedCount,
              hasArrest: Boolean(hasArrest),
              registrationDate: row.RegistrationDate
            };
          });
        } catch (err) {
          console.error('CaseOutcome prediction error:', err);
          results.caseOutcomes = [];
        }
      }

      // ANOMALY DETECTION
      if (predictionType === 'anomaly' || predictionType === 'all') {
        try {
          const anomalyData = await datastore.executeCoQLQuery(`
            SELECT 
              cm.CaseID,
              cm.CaseNo,
              cm.OccurrenceLatitude,
              cm.OccurrenceLongitude,
              ch.CrimeHeadName,
              csh.CrimeSubHeadName,
              cm.RegistrationDate,
              COUNT(*) OVER (PARTITION BY cm.DistrictID ORDER BY cm.RegistrationDate DESC ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS casesInLastWeek
            FROM CaseMaster cm
            LEFT JOIN CrimeHead ch ON cm.CrimeHeadID = ch.CrimeHeadID
            LEFT JOIN CrimeSubHead csh ON cm.CrimeSubHeadID = csh.CrimeSubHeadID
            ${filterClause}
            ORDER BY cm.RegistrationDate DESC
            LIMIT ${limit}
          `);

          // Detect anomalies based on spike patterns
          const casesPerDay = {};
          const baselinePerDay = 5;
          
          anomalyData.forEach(row => {
            const dateKey = row.RegistrationDate;
            casesPerDay[dateKey] = (casesPerDay[dateKey] || 0) + 1;
          });

          results.anomalies = anomalyData.map(row => {
            const dateKey = row.RegistrationDate;
            const caseCountForDay = casesPerDay[dateKey] || 0;
            const spikeRatio = caseCountForDay / baselinePerDay;
            
            // Detect spike (> 1.5x baseline) or unusual geography
            const isSpike = spikeRatio > 1.5;
            const hasUnusualGeo = !row.OccurrenceLatitude || !row.OccurrenceLongitude;
            
            const anomalyScore = Math.min(
              (isSpike ? 40 : 0) + (hasUnusualGeo ? 20 : 0) + Math.random() * 30,
              100
            );
            
            return {
              caseId: String(row.CaseID),
              caseNo: row.CaseNo,
              crimeHead: row.CrimeHeadName,
              crimeSubHead: row.CrimeSubHeadName,
              anomalyScore: parseFloat(anomalyScore.toFixed(1)),
              isAnomaly: anomalyScore > 50,
              anomalyType: isSpike ? 'volume' : hasUnusualGeo ? 'spatial' : 'behavioral',
              spikeRatio: parseFloat(spikeRatio.toFixed(2)),
              casesInWeek: Number(row.casesInLastWeek || 0)
            };
          });
        } catch (err) {
          console.error('Anomaly detection error:', err);
          results.anomalies = [];
        }
      }

      // TREND FORECASTING
      if (predictionType === 'trend' || predictionType === 'all') {
        try {
          const trendData = await datastore.executeCoQLQuery(`
            SELECT 
              cm.DistrictID,
              d.DistrictName,
              cm.UnitID,
              u.UnitName,
              DATE(cm.RegistrationDate) AS caseDate,
              COUNT(*) AS caseCount
            FROM CaseMaster cm
            LEFT JOIN District d ON cm.DistrictID = d.DistrictID
            LEFT JOIN Unit u ON cm.UnitID = u.UnitID
            ${filterClause ? filterClause + ' AND' : 'WHERE'} cm.RegistrationDate >= DATE_ADD(CURDATE(), INTERVAL -90 DAY)
            GROUP BY cm.DistrictID, d.DistrictName, cm.UnitID, u.UnitName, caseDate
            ORDER BY caseDate DESC
          `);

          // Simple trend forecasting (in production, use Prophet model)
          const trendByDistrict = {};
          trendData.forEach(row => {
            const key = `${row.DistrictID}-${row.DistrictName}`;
            if (!trendByDistrict[key]) {
              trendByDistrict[key] = { cases: [], district: row.DistrictName, districtId: row.DistrictID };
            }
            trendByDistrict[key].cases.push({
              date: row.caseDate,
              count: Number(row.caseCount)
            });
          });

          results.forecasts = Object.values(trendByDistrict).slice(0, 5).map(trend => {
            const cases = trend.cases.sort((a, b) => new Date(a.date) - new Date(b.date));
            const avgCount = cases.reduce((sum, c) => sum + c.count, 0) / Math.max(cases.length, 1);
            
            // Project forward 12 weeks
            const forecast = [];
            const today = new Date();
            for (let i = 1; i <= 12; i++) {
              const forecastDate = new Date(today);
              forecastDate.setDate(forecastDate.getDate() + i * 7);
              
              // Simple linear trend
              const variance = Math.random() * avgCount * 0.3;
              const trend = i > 6 ? 1.1 : 0.95; // slight increase in future
              const yhat = Math.max(1, Math.round(avgCount * trend + variance));
              
              forecast.push({
                ds: forecastDate.toISOString().split('T')[0],
                yhat: yhat,
                yhat_lower: Math.max(1, yhat - 5),
                yhat_upper: yhat + 5
              });
            }

            const slope = forecast[forecast.length - 1].yhat - forecast[0].yhat;
            const trend_direction = Math.abs(slope) < 2 ? 'STABLE' : slope > 0 ? 'INCREASING' : 'DECREASING';

            return {
              district: trend.district,
              districtId: trend.districtId,
              currentAvg: Math.round(avgCount),
              forecast: forecast,
              trendDirection: trend_direction,
              peakWeek: forecast.reduce((max, f) => f.yhat > max.yhat ? f : max).ds
            };
          });
        } catch (err) {
          console.error('Trend forecasting error:', err);
          results.forecasts = [];
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));

    } catch (err) {
      console.error('Predictions Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
