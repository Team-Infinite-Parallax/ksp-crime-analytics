const catalyst = require('zcatalyst-sdk-node');
const { requireAuth } = require('./authMiddleware');

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initializeApp(req);
      const datastore = app.datastore();
      const user = req.user;

      const todayStr = new Date().toISOString().split('T')[0];

      // Build dynamic where clause based on role
      let filterClause = '';
      let filterClauseCm = ''; // with table prefix for joins
      
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          filterClause = `WHERE DistrictID = ${districtId}`;
          filterClauseCm = `WHERE cm.DistrictID = ${districtId}`;
        } else {
          // If no district is assigned, return empty/zeroed stats
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            totalFIRs: 0,
            activeCases: 0,
            closedCases: 0,
            todaysCrimes: 0,
            topDistrict: 'N/A',
            topCrime: 'N/A',
            averageInvestigationDays: 0,
            message: 'No district assigned to this officer.'
          }));
        }
      }

      // Single table scan for all count metrics
      const countResp = await datastore.executeCoQLQuery(`
        SELECT
          COUNT(*) AS totalFirs,
          SUM(CASE WHEN CaseStatusID IN (4,5) THEN 1 ELSE 0 END) AS closedCases,
          SUM(CASE WHEN CaseStatusID IN (1,2,3,6,7) THEN 1 ELSE 0 END) AS activeCases,
          SUM(CASE WHEN RegistrationDate = '${todayStr}' THEN 1 ELSE 0 END) AS todaysCrimes
        FROM CaseMaster
        ${filterClause}
      `);

      // Top district by case volume (uses index on DistrictID)
      const districtResp = await datastore.executeCoQLQuery(`
        SELECT d.DistrictName, COUNT(cm.CaseID) AS cnt
        FROM CaseMaster cm
        INNER JOIN District d ON cm.DistrictID = d.DistrictID
        ${filterClauseCm}
        GROUP BY d.DistrictID, d.DistrictName
        ORDER BY cnt DESC
        LIMIT 1
      `);

      // Top crime head by case volume (uses index on CrimeHeadID)
      const crimeResp = await datastore.executeCoQLQuery(`
        SELECT ch.CrimeHeadName, COUNT(cm.CaseID) AS cnt
        FROM CaseMaster cm
        INNER JOIN CrimeHead ch ON cm.CrimeHeadID = ch.CrimeHeadID
        ${filterClauseCm}
        GROUP BY ch.CrimeHeadID, ch.CrimeHeadName
        ORDER BY cnt DESC
        LIMIT 1
      `);

      // Average days from registration to chargesheet filing
      const invResp = await datastore.executeCoQLQuery(`
        SELECT COALESCE(AVG(DATEDIFF(cs.CSDate, cm.RegistrationDate)), 0) AS avgDays
        FROM ChargesheetDetails cs
        INNER JOIN CaseMaster cm ON cs.CaseID = cm.CaseID
        ${filterClauseCm}
      `);

      const counts = countResp[0] || { totalFirs: 0, activeCases: 0, closedCases: 0, todaysCrimes: 0 };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        totalFIRs: Number(counts.totalFirs || 0),
        activeCases: Number(counts.activeCases || 0),
        closedCases: Number(counts.closedCases || 0),
        todaysCrimes: Number(counts.todaysCrimes || 0),
        topDistrict: districtResp[0]?.DistrictName || 'N/A',
        topCrime: crimeResp[0]?.CrimeHeadName || 'N/A',
        averageInvestigationDays: Math.round(Number(invResp[0]?.avgDays || 0))
      }));

    } catch (err) {
      console.error('Dashboard Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
