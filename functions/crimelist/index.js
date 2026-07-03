const catalyst = require('zcatalyst-sdk-node');
const { requireAuth } = require('./authMiddleware');

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER', 'INVESTIGATION_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initializeApp(req);
      const datastore = app.datastore();
      const user = req.user;

      let joinFilterCm = '';
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          joinFilterCm = `AND cm.DistrictID = ${districtId}`;
        }
      } else if (user.role === 'INVESTIGATION_OFFICER') {
        const unitId = user.employee?.unitID;
        if (unitId) {
          joinFilterCm = `AND cm.UnitID = ${unitId}`;
        }
      }

      const headResp = await datastore.executeCoQLQuery(`
        SELECT ch.CrimeHeadID, ch.CrimeHeadName, COUNT(cm.CaseID) AS cnt
        FROM CrimeHead ch
        LEFT JOIN CaseMaster cm ON ch.CrimeHeadID = cm.CrimeHeadID ${joinFilterCm}
        GROUP BY ch.CrimeHeadID, ch.CrimeHeadName
        ORDER BY ch.CrimeHeadID
      `);

      const subResp = await datastore.executeCoQLQuery(`
        SELECT cs.CrimeSubHeadID, cs.CrimeSubHeadName, cs.CrimeHeadID, COUNT(cm.CaseID) AS cnt
        FROM CrimeSubHead cs
        LEFT JOIN CaseMaster cm ON cs.CrimeSubHeadID = cm.CrimeSubHeadID ${joinFilterCm}
        GROUP BY cs.CrimeSubHeadID, cs.CrimeSubHeadName, cs.CrimeHeadID
        ORDER BY cs.CrimeHeadID, cs.CrimeSubHeadID
      `);

      const subMap = {};
      for (const row of subResp) {
        const hid = Number(row.CrimeHeadID);
        if (!subMap[hid]) subMap[hid] = [];
        subMap[hid].push({
          crimeSubHeadID: Number(row.CrimeSubHeadID),
          crimeSubHeadName: row.CrimeSubHeadName,
          caseCount: Number(row.cnt || 0)
        });
      }

      const crimeList = headResp.map(row => ({
        crimeHeadID: Number(row.CrimeHeadID),
        crimeHeadName: row.CrimeHeadName,
        caseCount: Number(row.cnt || 0),
        subHeads: subMap[Number(row.CrimeHeadID)] || []
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ crimeList }));

    } catch (err) {
      console.error('CrimeList Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
