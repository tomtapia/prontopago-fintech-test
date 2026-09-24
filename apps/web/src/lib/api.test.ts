import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiLogin, apiScore, friendlyError, ApiError } from './api.js';

describe('api client', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('login posts and returns token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ token: 't', user: { id: '1', role: 'user' } }), { status: 200 })));
    const r = await apiLogin('u', 'p');
    expect(r.token).toBe('t');
  });
  it('maps 401/403/400 to friendly messages', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'X', message: 'm' } }), { status: 403 })));
    try {
      await apiScore('11.111.111-1', 't');
      expect.unreachable();
    } catch (e) {
      expect(friendlyError(e)).toContain('No autorizado');
    }
    expect(friendlyError(new ApiError(401, 'x'))).toContain('Sesión expirada');
    expect(friendlyError(new ApiError(400, 'x'))).toContain('RUT inválido');
    expect(friendlyError(new Error('boom'))).toContain('inesperado');
  });
  it('score sends Bearer header', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ rut: 'x', score: 1, fecha: 'y' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await apiScore('11.111.111-1', 'tok123');
    const call = fetchMock.mock.calls[0] as unknown as [{}, { headers: { Authorization: string } }];
    expect(call[1].headers.Authorization).toBe('Bearer tok123');
  });
});
