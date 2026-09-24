import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../../config.js';

export interface AuthUser {
  sub: string;
  role: 'admin' | 'user';
  rut?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(Object.assign(new Error('Missing token'), { status: 401, code: 'UNAUTHORIZED' }));
    return;
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, getConfig().jwtSecret) as AuthUser;
    if (!decoded?.sub || (decoded.role !== 'admin' && decoded.role !== 'user')) {
      throw new Error('bad payload');
    }
    req.user = decoded;
    next();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    const expired = msg.includes('expired');
    next(
      Object.assign(new Error(expired ? 'Token expired' : 'Invalid token'), {
        status: 401,
        code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      })
    );
  }
}
