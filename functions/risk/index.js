const catalyst = require('zcatalyst-sdk-node');
const url = require('url');
const { requireAuth } = require('./authMiddleware');

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER', 'INVESTIGATION_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initializeApp(req);
      const datastore = app.datastore();
      const user = req.user;

      const parsed = url.parse(req.url, true);
      const query = parsed.query || {};

      const conditions = [];
      if (query.isRepeatOffender !== undefined) {
        conditions.push(`a.IsRepeatOffender = ${Number(query.isRepeatOffender)}`);
      }

      // Enforce role-based limits on case metrics
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          conditions.push(`cm.DistrictID = ${districtId}`);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ riskScores: [], count: 0, message: 'No district assigned to this officer.' }));
        }
      } else if (user.role === 'INVESTIGATION_OFFICER') {
        const unitId = user.employee?.unitID;
        if (unitId) {
          conditions.push(`cm.UnitID = ${unitId}`);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ riskScores: [], count: 0, message: 'No police station unit assigned to this officer.' }));
        }
      }

      const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

      const sql = `
        SELECT a.AccusedID, a.Name, a.Gender, a.Age,
               a.IsRepeatOffender, a.IsNetworkMember,
               COUNT(cm.CaseID) AS caseCount,
               COUNT(DISTINCT cm.DistrictID) AS distinctDistricts,
               SUM(CASE WHEN cm.GravityOffenceID = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(cm.CaseID) AS heinousRatio
        FROM Accused a
        INNER JOIN CaseMaster cm ON a.CaseID = cm.CaseID
        ${whereClause}
        GROUP BY a.AccusedID, a.Name, a.Gender, a.Age, a.IsRepeatOffender, a.IsNetworkMember
        ORDER BY caseCount DESC
        LIMIT ${limit}
      `;

      const rows = await datastore.executeCoQLQuery(sql);

      const scored = rows.map(row => {
        const caseCount = Number(row.caseCount);
        const distinctDistricts = Number(row.distinctDistricts);
        const heinousRatio = Number(row.heinousRatio || 0);
        const isNetwork = Number(row.IsNetworkMember || 0);

        const frequencyScore = Math.min((caseCount / 10) * 40, 40);
        const spreadScore = Math.min((distinctDistricts / 3) * 25, 25);
        const gravityScore = heinousRatio * 20;
        const networkBonus = isNetwork ? 15 : 0;

        const riskScore = Math.round(frequencyScore + spreadScore + gravityScore + networkBonus);

        return {
          accusedID: Number(row.AccusedID),
          name: row.Name,
          gender: row.Gender,
          age: Number(row.Age),
          isRepeatOffender: Boolean(Number(row.IsRepeatOffender)),
          isNetworkMember: Boolean(isNetwork),
          caseCount,
          distinctDistricts,
          heinousRatio: Math.round(heinousRatio * 100) / 100,
          riskScore: Math.min(riskScore, 100)
        };
      });

      const minScore = Number(query.minScore) || 0;
      const filtered = minScore > 0
        ? scored.filter(s => s.riskScore >= minScore)
        : scored;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ riskScores: filtered, count: filtered.length }));

    } catch (err) {
      console.error('Risk Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
