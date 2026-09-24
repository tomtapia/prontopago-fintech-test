import type { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const e = err as { status?: number; code?: string; message?: string; issues?: unknown };
  const status = typeof e?.status === 'number' ? e.status : 500;
  const code = e?.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = status === 500 ? 'Internal server error' : (e?.message ?? 'Error');
  res.status(status).json({ error: { code, message } });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
}
