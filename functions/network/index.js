const catalyst = require('zcatalyst-sdk-node');
const url = require('url');
const { requireAuth } = require('./authMiddleware');

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initialize(req);
      const datastore = app.datastore();
      const user = req.user;

      const parsed = url.parse(req.url, true);
      const query = parsed.query || {};

      const minShared = Math.max(Number(query.minSharedCases) || 3, 1);
      const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);

      // Build dynamic filter clause for district officer
      let filterClause = '';
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          filterClause = `WHERE cm.DistrictID = ${districtId}`;
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ nodes: [], edges: [], message: 'No district assigned to this officer.' }));
        }
      }

      const edgeSql = `
        SELECT a1.AccusedID AS sourceID, a1.Name AS sourceName,
               a2.AccusedID AS targetID, a2.Name AS targetName,
               COUNT(*) AS sharedCases
        FROM Accused a1
        INNER JOIN Accused a2 ON a1.CaseID = a2.CaseID AND a1.AccusedID < a2.AccusedID
        INNER JOIN CaseMaster cm ON a1.CaseID = cm.CaseID
        ${filterClause}
        GROUP BY a1.AccusedID, a1.Name, a2.AccusedID, a2.Name
        HAVING sharedCases >= ${minShared}
        ORDER BY sharedCases DESC
        LIMIT ${limit}
      `;

      const edges = await datastore.executeCoQLQuery(edgeSql);

      const nodeMap = {};
      const edgeList = [];

      for (const row of edges) {
        const sid = Number(row.sourceID);
        const tid = Number(row.targetID);

        if (!nodeMap[sid]) {
          nodeMap[sid] = { accusedID: sid, name: row.sourceName, caseCount: 0 };
        }
        if (!nodeMap[tid]) {
          nodeMap[tid] = { accusedID: tid, name: row.targetName, caseCount: 0 };
        }

        const shared = Number(row.sharedCases);
        nodeMap[sid].caseCount += shared;
        nodeMap[tid].caseCount += shared;

        edgeList.push({ source: sid, target: tid, sharedCases: shared });
      }

      const nodes = Object.values(nodeMap);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ nodes, edges: edgeList }));

    } catch (err) {
      console.error('Network Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
