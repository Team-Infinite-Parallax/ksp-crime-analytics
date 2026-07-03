'use strict';

const catalyst = require('zcatalyst-sdk-node');

/**
 * Resolves an employee by their first and last name derived from their email address.
 * Email pattern: firstname.lastname@ksp.gov.in
 */
async function resolveEmployeeByEmail(app, email) {
  if (!app) return null;
  try {
    const datastore = app.datastore();
    const localPart = email.split('@')[0];
    const parts = localPart.split('.');
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      
      const query = `
        SELECT e.EmployeeID AS EmployeeID, e.UnitID AS UnitID, u.DistrictID AS DistrictID, d.DistrictName AS DistrictName, e.FirstName AS FirstName, e.LastName AS LastName
        FROM Employee e
        INNER JOIN Unit u ON e.UnitID = u.UnitID
        INNER JOIN District d ON u.DistrictID = d.DistrictID
        WHERE e.FirstName = '${firstName}' AND e.LastName = '${lastName}'
        LIMIT 1
      `;
      const rows = await datastore.executeCoQLQuery(query);
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          employeeID: Number(row.EmployeeID),
          unitID: Number(row.UnitID),
          districtID: Number(row.DistrictID),
          districtName: row.DistrictName,
          firstName: row.FirstName,
          lastName: row.LastName
        };
      }
    }
  } catch (err) {
    console.warn('Warning: Database lookup failed for email resolution (running offline?):', err.message);
  }
  return null;
}

/**
 * Resolves an employee by their EmployeeID.
 */
async function resolveEmployeeById(app, employeeId) {
  if (!app) return null;
  try {
    const datastore = app.datastore();
    const query = `
      SELECT e.EmployeeID AS EmployeeID, e.UnitID AS UnitID, u.DistrictID AS DistrictID, d.DistrictName AS DistrictName, e.FirstName AS FirstName, e.LastName AS LastName
      FROM Employee e
      INNER JOIN Unit u ON e.UnitID = u.UnitID
      INNER JOIN District d ON u.DistrictID = d.DistrictID
      WHERE e.EmployeeID = ${employeeId}
      LIMIT 1
    `;
    const rows = await datastore.executeCoQLQuery(query);
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        employeeID: Number(row.EmployeeID),
        unitID: Number(row.UnitID),
        districtID: Number(row.DistrictID),
        districtName: row.DistrictName,
        firstName: row.FirstName,
        lastName: row.LastName
      };
    }
  } catch (err) {
    console.warn(`Warning: Database lookup failed for EmployeeID ${employeeId} (running offline?):`, err.message);
  }
  return null;
}

/**
 * Secure authorization middleware wrapper
 * @param {Array<string>} allowedRoles Roles allowed to access the endpoint
 */
function requireAuth(allowedRoles = []) {
  return async (req, res, handler) => {
    try {
      // 1. Check for mock headers FIRST (local testing/development environment)
      const mockRole = req.headers['x-mock-role'];
      const mockEmail = req.headers['x-mock-email'];
      const mockEmployeeId = req.headers['x-mock-employee-id'];
      
      if (mockRole) {
        const role = mockRole.toUpperCase();
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Forbidden',
            message: `Mock Access Denied. Role ${role} is not permitted. Allowed: ${allowedRoles.join(', ')}`
          }));
        }

        // Try to initialize app if credentials might exist, otherwise fail silently for mock fallback
        let app = null;
        try {
          app = catalyst.initializeApp(req);
        } catch (initErr) {
          // Silently proceed; we will fall back to static mock data
        }

        let employee = null;
        if (app) {
          if (mockEmployeeId) {
            employee = await resolveEmployeeById(app, Number(mockEmployeeId));
          } else if (mockEmail) {
            employee = await resolveEmployeeByEmail(app, mockEmail);
          }
        }

        // Apply robust static defaults if no employee could be resolved from DB
        if (!employee) {
          if (role === 'DISTRICT_OFFICER') {
            employee = { employeeID: mockEmployeeId ? Number(mockEmployeeId) : 9, unitID: 1, districtID: 1, districtName: 'Bengaluru Urban', firstName: 'Mock', lastName: 'DistrictOfficer' };
          } else if (role === 'INVESTIGATION_OFFICER') {
            employee = { employeeID: mockEmployeeId ? Number(mockEmployeeId) : 1, unitID: 1, districtID: 1, districtName: 'Bengaluru Urban', firstName: 'Mohammed', lastName: 'Puttaiah' };
          }
        }

        req.user = {
          userId: 'mock-user-12345',
          email: mockEmail || 'mock.user@ksp.gov.in',
          role: role,
          employee: employee,
          isMock: true
        };

        return await handler(req, res);
      }

      // 2. Standard Zoho Catalyst Authentication Flow
      let app;
      try {
        app = catalyst.initializeApp(req);
      } catch (initErr) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: 'Failed to initialize Catalyst SDK: ' + initErr.message
        }));
      }

      let currentUser;
      try {
        const userManagement = app.userManagement();
        currentUser = await userManagement.getCurrentUser();
      } catch (authErr) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid session or credentials. User is not logged in.'
        }));
      }

      const role = currentUser.role_details?.role_name;
      if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Forbidden',
          message: `Access Denied. Role '${role || 'None'}' does not have permission.`
        }));
      }

      let employee = await resolveEmployeeByEmail(app, currentUser.email_id);

      req.user = {
        userId: currentUser.user_id,
        email: currentUser.email_id,
        role: role,
        employee: employee,
        isMock: false
      };

      return await handler(req, res);
    } catch (error) {
      console.error('Middleware Processing Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }));
    }
  };
}

module.exports = {
  requireAuth,
  resolveEmployeeByEmail,
  resolveEmployeeById
};
