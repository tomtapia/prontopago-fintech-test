import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';

describe('POST /login', () => {
  it('returns JWT with sub/role/rut for user', async () => {
    const app = createApp();
    const res = await request(app).post('/login').send({ username: 'user1@prontopago.cl', password: 'user123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ role: 'user', rut: '11111111-1' });
    const decoded = jwt.verify(res.body.token, getConfig().jwtSecret) as { sub: string; role: string; rut: string };
    expect(decoded.sub).toBe('user-1');
    expect(decoded.role).toBe('user');
    expect(decoded.rut).toBe('11111111-1');
  });
  it('returns JWT without rut for admin', async () => {
    const app = createApp();
    const res = await request(app).post('/login').send({ username: 'admin@prontopago.cl', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.rut).toBeUndefined();
    const decoded = jwt.verify(res.body.token, getConfig().jwtSecret) as Record<string, unknown>;
    expect(decoded['rut']).toBeUndefined();
  });
  it('supports K-RUT user login', async () => {
    const app = createApp();
    const res = await request(app).post('/login').send({ username: 'userk@prontopago.cl', password: 'userk123' });
    expect(res.status).toBe(200);
    expect(res.body.user.rut).toBe('8765432-K');
  });
  it('401 on bad creds, 400 on bad body', async () => {
    const app = createApp();
    expect((await request(app).post('/login').send({ username: 'x', password: 'y' })).status).toBe(401);
    expect((await request(app).post('/login').send({ username: 'x' })).status).toBe(400);
    expect((await request(app).post('/login').send({})).status).toBe(400);
  });
  it('health and 404 shape', async () => {
    const app = createApp();
    expect((await request(app).get('/health')).status).toBe(200);
    const nf = await request(app).get('/nope');
    expect(nf.status).toBe(404);
    expect(nf.body.error.code).toBe('NOT_FOUND');
  });
});
