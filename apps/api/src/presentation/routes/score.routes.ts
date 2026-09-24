import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeScore } from '../middlewares/authorizeScore.js';
import { scoreParamsSchema } from '../schemas.js';
import { queryScore } from '../../application/score.service.js';

export const scoreRouter: ExpressRouter = Router();

scoreRouter.get('/score/:rut', authenticate, authorizeScore, (req, res, next) => {
  const parsed = scoreParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    next(Object.assign(new Error('Invalid params'), { status: 400, code: 'INVALID_RUT' }));
    return;
  }
  try {
    res.json(queryScore(parsed.data.rut));
  } catch (e) {
    next(e);
  }
});
