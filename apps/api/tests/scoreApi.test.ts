import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';
import { clearScoreCache } from '../src/infrastructure/scoreCache.js';

async function loginAs(app: ReturnType<typeof createApp>, username: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ username, password });
  return res.body.token as string;
}

describe('GET /score/:rut RBAC', () => {
  beforeEach(() => clearScoreCache());

  it('user can query own RUT deterministically, 403 on foreign RUT', async () => {
    const app = createApp();
    const token = await loginAs(app, 'user1@prontopago.cl', 'user123');
    const own1 = await request(app).get('/score/11.111.111-1').set('Authorization', `Bearer ${token}`);
    expect(own1.status).toBe(200);
    expect(own1.body.rut).toBe('11111111-1');
    expect(own1.body.score).toBeGreaterThanOrEqual(0);
    expect(new Date(own1.body.fecha).toString()).not.toBe('Invalid Date');
    const own2 = await request(app).get('/score/11111111-1').set('Authorization', `Bearer ${token}`);
    expect(own2.body.score).toBe(own1.body.score);
    const foreign = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${token}`);
    expect(foreign.status).toBe(403);
    expect(foreign.body.error.code).toBe('OWN_RUT_ONLY');
  });
  it('K user can query own K RUT case-insensitively', async () => {
    const app = createApp();
    const token = await loginAs(app, 'userk@prontopago.cl', 'userk123');
    const res = await request(app).get('/score/8.765.432-k').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rut).toBe('8765432-K');
  });
  it('admin can query any valid RUT', async () => {
    const app = createApp();
    const token = await loginAs(app, 'admin@prontopago.cl', 'admin123');
    for (const rut of ['11.111.111-1', '12.345.678-5', '8.765.432-K']) {
      const res = await request(app).get(`/score/${encodeURIComponent(rut)}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });
  it('401 without/invalid/expired token, 400 on invalid RUT', async () => {
    const app = createApp();
    expect((await request(app).get('/score/11.111.111-1')).status).toBe(401);
    expect(
      (await request(app).get('/score/11.111.111-1').set('Authorization', 'Bearer bad')).status
    ).toBe(401);
    const admin = await loginAs(app, 'admin@prontopago.cl', 'admin123');
    const bad = await request(app).get('/score/not-a-rut').set('Authorization', `Bearer ${admin}`);
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('INVALID_RUT');
    const expired = jwt.sign({ sub: 'admin-1', role: 'admin' }, getConfig().jwtSecret, { expiresIn: '-10s' });
    const exp = await request(app).get('/score/11.111.111-1').set('Authorization', `Bearer ${expired}`);
    expect(exp.status).toBe(401);
    expect(exp.body.error.code).toBe('TOKEN_EXPIRED');
  });
});
