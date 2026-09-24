import jwt from 'jsonwebtoken';
import { mockUsers } from '../infrastructure/users.mock.js';
import { getConfig } from '../config.js';
import { normalizeRut } from '../domain/rut.js';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'user';
  rut?: string;
}

export function login(username: string, password: string): {
  token: string;
  user: { id: string; role: 'admin' | 'user'; rut?: string };
} {
  const u = mockUsers.find((x) => x.username === username && x.password === password);
  if (!u) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401, code: 'INVALID_CREDENTIALS' });
  }
  const { jwtSecret, jwtExpiresIn } = getConfig();
  const payload: JwtPayload =
    u.role === 'admin'
      ? { sub: u.id, role: u.role }
      : { sub: u.id, role: u.role, rut: normalizeRut(u.rut as string) };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  return {
    token,
    user: u.role === 'admin' ? { id: u.id, role: u.role } : { id: u.id, role: u.role, rut: (payload as JwtPayload).rut }
  };
}
