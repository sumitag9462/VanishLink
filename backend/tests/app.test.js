// backend/tests/app.test.js
const request = require('supertest');
const express = require('express');
const { errorHandler } = require('../middleware/errorHandler');
const Link = require('../models/Link');

// Minimal app setup for testing controllers without full server
const app = express();
app.use(express.json());

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

describe('Basic API Tests', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });
  
  it('Can create a Link in memory DB', async () => {
    const link = await Link.create({
      title: 'Test Link',
      slug: 'test1234',
      targetUrl: 'https://example.com'
    });
    
    expect(link.slug).toEqual('test1234');
    expect(link.targetUrl).toEqual('https://example.com');
  });
});
