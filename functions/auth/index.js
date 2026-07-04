'use strict';

const url = require('url');
const { requireAuth } = require('./middleware');
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

  // Normalise path (strip trailing slashes, keep lowercase)
  const route = pathname.replace(/\/$/, '').toLowerCase();

  // Root path check
  if (route === '' || route === '/' || route === '/auth') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      message: 'KSP Catalyst Authentication Service is active.',
      endpoints: ['GET /profile', 'GET /login-status']
    }));
  }

  // Route: /profile
  if (route.endsWith('/profile')) {
    // Requires any of the defined roles
    const handler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER', 'INVESTIGATION_OFFICER']);
    return handler(req, res, async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authenticated: true,
        user: req.user
      }));
    });
  }

  // Route: /login-status
  if (route.endsWith('/login-status')) {
    try {
      const app = catalyst.initialize(req);
      
      // Check for mock headers
      const mockRole = req.headers['x-mock-role'];
      if (mockRole) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          authenticated: true,
          role: mockRole.toUpperCase(),
          isMock: true
        }));
      }

      const currentUser = await app.userManagement().getCurrentUser();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authenticated: true,
        role: currentUser.role_details?.role_name,
        isMock: false
      }));
    } catch (err) {
      // User is not authenticated
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authenticated: false,
        message: 'No active session found.'
      }));
    }
    return;
  }

  // 404 handler
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Endpoint ${req.url} does not exist on Auth Service.`
  }));
  } catch (err) {
    console.error('Unhandled Auth Error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred in the Auth Service.'
      }));
    }
  }
};
