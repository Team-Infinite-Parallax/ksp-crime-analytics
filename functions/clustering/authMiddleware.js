const catalyst = require('zcatalyst-sdk-node');

function requireAuth(allowedRoles = []) {
  return async (req, res, handler) => {
    try {
      const app = catalyst.initialize(req);
      const datastore = app.datastore();

      let userEmail = req.headers['x-employee-email'];
      let userRole = req.headers['x-employee-role'];

      if (!userEmail || !userRole) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized', message: 'Missing auth headers' }));
      }

      let employeeData = null;
      try {
        const empRows = await datastore.executeCoQLQuery(`
          SELECT EmployeeID, EmployeeName, DistrictID, UnitID FROM Employee WHERE EmailID = '${userEmail}' LIMIT 1
        `);
        if (empRows && empRows.length > 0) {
          employeeData = empRows[0];
        }
      } catch (e) {
        console.warn('Employee lookup failed:', e.message);
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Forbidden', message: `Required role: ${allowedRoles.join(', ')}` }));
      }

      req.user = {
        email: userEmail,
        role: userRole,
        employee: employeeData || {}
      };

      return handler(req, res);

    } catch (err) {
      console.error('Auth error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  };
}

module.exports = { requireAuth };
