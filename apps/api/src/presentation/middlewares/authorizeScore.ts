import type { Request, Response, NextFunction } from 'express';
import { normalizeRut } from '../../domain/rut.js';

/** RBAC for GET /score/:rut — user only own RUT, admin any. */
export function authorizeScore(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    next(Object.assign(new Error('Missing auth'), { status: 401, code: 'UNAUTHORIZED' }));
    return;
  }
  if (user.role === 'admin') {
    next();
    return;
  }
  const tokenRut = user.rut ? normalizeRut(user.rut) : '';
  const paramRut = normalizeRut(req.params.rut ?? '');
  if (!tokenRut || tokenRut !== paramRut) {
    next(
      Object.assign(new Error('Forbidden: can only query own RUT'), {
        status: 403,
        code: 'OWN_RUT_ONLY'
      })
    );
    return;
  }
  next();
}
