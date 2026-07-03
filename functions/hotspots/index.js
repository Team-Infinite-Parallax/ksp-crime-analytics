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

      const conditions = ['o.Latitude IS NOT NULL', 'o.Longitude IS NOT NULL'];

      if (query.crimeSubHeadIds) {
        const ids = query.crimeSubHeadIds.split(',').map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) {
          conditions.push(`cm.CrimeSubHeadID IN (${ids.join(',')})`);
        }
      }

      // Enforce role-based spatial filters
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          conditions.push(`cm.DistrictID = ${districtId}`);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ hotspots: [], count: 0, message: 'No district assigned to this officer.' }));
        }
      } else if (user.role === 'INVESTIGATION_OFFICER') {
        const unitId = user.employee?.unitID;
        if (unitId) {
          conditions.push(`cm.UnitID = ${unitId}`);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ hotspots: [], count: 0, message: 'No police station unit assigned to this officer.' }));
        }
      } else {
        // SCRB_ADMIN - allow optional district filtering via query params
        if (query.districtId) {
          const did = Number(query.districtId);
          if (!isNaN(did)) {
            conditions.push(`cm.DistrictID = ${did}`);
          }
        }
      }

      if (query.startDate) {
        conditions.push(`cm.RegistrationDate >= '${query.startDate}'`);
      }

      if (query.endDate) {
        conditions.push(`cm.RegistrationDate <= '${query.endDate}'`);
      }

      const limit = Math.min(Math.max(Number(query.limit) || 1000, 1), 5000);

      const sql = `
        SELECT cm.CaseID, cm.RegistrationDate, cm.CrimeSubHeadID,
               o.Latitude, o.Longitude, o.IncidentFromDate
        FROM CaseMaster cm
        INNER JOIN OccurrenceTime o ON cm.CaseID = o.CaseID
        WHERE ${conditions.join(' AND ')}
        ORDER BY cm.RegistrationDate DESC
        LIMIT ${limit}
      `;

      const result = await datastore.executeCoQLQuery(sql);

      const hotspots = result.map(row => ({
        caseID: Number(row.CaseID),
        crimeSubHeadID: Number(row.CrimeSubHeadID),
        registrationDate: row.RegistrationDate,
        incidentFromDate: row.IncidentFromDate,
        latitude: Number(row.Latitude),
        longitude: Number(row.Longitude)
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ hotspots, count: hotspots.length }));

    } catch (err) {
      console.error('Hotspots Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
