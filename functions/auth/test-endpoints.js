'use strict';

// Mock request and response classes for testing
class MockRequest {
  constructor(headers = {}, url = '/') {
    this.headers = headers;
    this.url = url;
    this.user = null;
  }
}

class MockResponse {
  constructor() {
    this.statusCode = null;
    this.headers = {};
    this.body = '';
    this.isEnded = false;
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    this.headers = { ...this.headers, ...headers };
  }

  end(body) {
    this.body = body;
    this.isEnded = true;
  }
}

// Mock the Zoho Catalyst SDK for offline testing of standard auth paths
const catalyst = require('zcatalyst-sdk-node');
catalyst.initializeApp = (req) => {
  return {
    userManagement: () => {
      return {
        getCurrentUser: async () => {
          // Standard mock rejection when user is not authenticated
          throw new Error('User session is not active.');
        }
      };
    }
  };
};

// Import auth middleware directly from the function directory
const { requireAuth } = require('./middleware');

async function runTests() {
  console.log('--- STARTING SECURITY MIDDLEWARE LOCAL TESTS ---\n');

  // Test 1: Unauthenticated request should be rejected with 401
  {
    console.log('Test 1: Unauthenticated request');
    const req = new MockRequest();
    const res = new MockResponse();
    
    const wrapper = requireAuth(['SCRB_ADMIN']);
    await wrapper(req, res, async (req, res) => {
      res.writeHead(200);
      res.end('Allowed');
    });

    console.log(`- Status: ${res.statusCode} (Expected: 401)`);
    console.log(`- Body: ${res.body}`);
    console.log(`- Result: ${res.statusCode === 401 ? 'PASS' : 'FAIL'}\n`);
  }

  // Test 2: Authorized role (SCRB_ADMIN) with mock headers should be allowed
  {
    console.log('Test 2: Authorized role (SCRB_ADMIN)');
    const req = new MockRequest({ 'x-mock-role': 'SCRB_ADMIN' });
    const res = new MockResponse();

    const wrapper = requireAuth(['SCRB_ADMIN']);
    await wrapper(req, res, async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Success', user: req.user }));
    });

    console.log(`- Status: ${res.statusCode} (Expected: 200)`);
    console.log(`- User Role: ${req.user?.role} (Expected: SCRB_ADMIN)`);
    console.log(`- Result: ${res.statusCode === 200 && req.user?.role === 'SCRB_ADMIN' ? 'PASS' : 'FAIL'}\n`);
  }

  // Test 3: Unauthorized role (INVESTIGATION_OFFICER calling SCRB_ADMIN endpoint) should be blocked
  {
    console.log('Test 3: Unauthorized role (INVESTIGATION_OFFICER calling SCRB_ADMIN endpoint)');
    const req = new MockRequest({ 'x-mock-role': 'INVESTIGATION_OFFICER' });
    const res = new MockResponse();

    const wrapper = requireAuth(['SCRB_ADMIN']);
    await wrapper(req, res, async (req, res) => {
      res.writeHead(200);
      res.end('Allowed');
    });

    console.log(`- Status: ${res.statusCode} (Expected: 403)`);
    console.log(`- Body: ${res.body}`);
    console.log(`- Result: ${res.statusCode === 403 ? 'PASS' : 'FAIL'}\n`);
  }

  // Test 4: DISTRICT_OFFICER should receive resolved district defaults
  {
    console.log('Test 4: DISTRICT_OFFICER defaults resolution');
    const req = new MockRequest({ 'x-mock-role': 'DISTRICT_OFFICER' });
    const res = new MockResponse();

    const wrapper = requireAuth(['DISTRICT_OFFICER']);
    await wrapper(req, res, async (req, res) => {
      res.writeHead(200);
      res.end('Allowed');
    });

    console.log(`- Status: ${res.statusCode} (Expected: 200)`);
    console.log(`- District: ${req.user?.employee?.districtName} (Expected: Bengaluru Urban)`);
    console.log(`- DistrictID: ${req.user?.employee?.districtID} (Expected: 1)`);
    console.log(`- Result: ${res.statusCode === 200 && req.user?.employee?.districtID === 1 ? 'PASS' : 'FAIL'}\n`);
  }

  console.log('--- ALL MIDDLEWARE TESTS EXECUTED ---');
}

runTests().catch(console.error);
