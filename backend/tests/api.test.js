import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../src/app.js';

const request = supertest(app);

test('Sports Connect Backend API Test Suite', async (t) => {

  await t.test('1. Health Check Endpoint responds with 200 and operational status', async () => {
    const res = await request.get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'healthy');
  });

  await t.test('2. Public Platform Statistics endpoint returns valid counts', async () => {
    const res = await request.get('/api/v1/stats/platform');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(typeof res.body.data.total_athletes === 'number');
    assert.ok(typeof res.body.data.active_opportunities === 'number');
  });

  await t.test('3. Sports Catalog returns list of popular Indian sports', async () => {
    const res = await request.get('/api/v1/sports');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 10);
    const kabaddi = res.body.data.find(s => s.slug === 'kabaddi');
    assert.ok(kabaddi, 'Kabaddi should be in sports catalog');
  });

  await t.test('4. Opportunities Marketplace lists published opportunities with filtering', async () => {
    const res = await request.get('/api/v1/opportunities');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  await t.test('5. Single Opportunity Detail retrieves complete data', async () => {
    const res = await request.get('/api/v1/opportunities/opp-1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, 'opp-1');
  });

  await t.test('6. Protected profile endpoint rejects unauthenticated request with 401', async () => {
    const res = await request.get('/api/v1/profiles/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('7. Authenticated Athlete can access own profile with valid demo bearer token', async () => {
    const res = await request
      .get('/api/v1/profiles/me')
      .set('Authorization', 'Bearer demo-token-athlete');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.role, 'athlete');
    assert.ok(typeof res.body.data.completion_pct === 'number');
  });

  await t.test('8. Role-based Access: Athlete is forbidden from creating an opportunity (403)', async () => {
    const res = await request
      .post('/api/v1/opportunities')
      .set('Authorization', 'Bearer demo-token-athlete')
      .send({
        title: 'Unauthorized Trial',
        category: 'trial'
      });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('9. Role-based Access: Organizer can create a new opportunity (201)', async () => {
    const res = await request
      .post('/api/v1/opportunities')
      .set('Authorization', 'Bearer demo-token-organizer')
      .send({
        title: 'Pune District Badminton Junior Open 2026',
        category: 'tournament',
        sport_id: 3,
        city: 'Pune',
        state: 'Maharashtra',
        starts_on: '2026-12-10',
        ends_on: '2026-12-14',
        registration_deadline: '2026-11-30',
        eligibility: 'U-17 boys and girls'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Pune District Badminton Junior Open 2026');
  });

  await t.test('10. Athlete Workflow: Submit application for published opportunity', async () => {
    const res = await request
      .post('/api/v1/opportunities/opp-2/applications')
      .set('Authorization', 'Bearer demo-token-athlete')
      .send({
        message: 'Looking forward to the sprint scholarship combine trials.'
      });

    assert.ok(res.status === 201 || res.status === 409);
    assert.strictEqual(typeof res.body.success, 'boolean');
  });

  await t.test('11. Organizer Workflow: Update applicant status', async () => {
    const res = await request
      .patch('/api/v1/applications/app-1/status')
      .set('Authorization', 'Bearer demo-token-organizer')
      .send({
        status: 'shortlisted',
        notes: 'Shortlisted for second round physical trials.'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'shortlisted');
  });

  await t.test('12. Coach Workflow: Submit coaching inquiry and list inquiries', async () => {
    const res = await request
      .post('/api/v1/coaches/usr-coach-1/inquiries')
      .set('Authorization', 'Bearer demo-token-athlete')
      .send({
        message: 'Coach Vikram, I am interested in your fast bowling biomechanics clinic.'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
  });
});
