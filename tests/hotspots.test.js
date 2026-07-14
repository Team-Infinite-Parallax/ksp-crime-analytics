const test = require('node:test');
const assert = require('node:assert');

class MockResponse {
  constructor() {
    this.statusCode = null;
    this.headers = null;
    this.body = null;
    this.ended = false;
  }
  writeHead(status, headers) {
    this.statusCode = status;
    this.headers = headers;
  }
  end(body) {
    this.body = body;
    this.ended = true;
  }
}

test('Hotspots Handler: enforces role-based constraints for DISTRICT_OFFICER', async () => {
  const originalEnv = process.env.CATALYST_ENV;
  process.env.NODE_ENV = 'development';
  process.env.CATALYST_ENV = 'development';

  const req = {
    url: '/hotspots?limit=10',
    headers: {
      'x-mock-role': 'DISTRICT_OFFICER',
      'x-mock-email': 'officer@ksp.gov.in',
      'x-catalyst-request': JSON.stringify({ project_id: 'test', project_key: 'test' })
    }
  };
  
  const res = new MockResponse();
  const handler = require('../functions/hotspots/index.js');
  
  await handler(req, res);

  if (res.statusCode === 200) {
    const body = JSON.parse(res.body);
    assert.strictEqual(body.hotspots.length, 0);
    assert.strictEqual(body.message, 'No district assigned to this officer.');
  } else {
    assert.strictEqual(res.statusCode, 500);
    const body = JSON.parse(res.body);
    assert(body.message.includes('Catalyst') || body.message.includes('Failed'));
  }

  process.env.CATALYST_ENV = originalEnv;
});
