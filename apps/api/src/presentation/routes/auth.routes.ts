import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../../application/auth.service.js';
import { loginSchema } from '../schemas.js';

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 60, standardHeaders: 'draft-7' });

authRouter.post('/login', loginLimiter, (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    next(Object.assign(new Error('Invalid body'), { status: 400, code: 'INVALID_BODY' }));
    return;
  }
  try {
    const result = login(parsed.data.username, parsed.data.password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
