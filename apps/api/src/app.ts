import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { authRouter } from './presentation/routes/auth.routes.js';
import { scoreRouter } from './presentation/routes/score.routes.js';
import { errorHandler, notFound } from './presentation/middlewares/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(authRouter);
  app.use(scoreRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
