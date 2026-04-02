import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool, healthCheck } from './config/database';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

app.use(env.API_PREFIX, generalLimiter);
app.use(env.API_PREFIX + '/auth', authLimiter);
app.use(env.API_PREFIX, routes);

app.get('/health', async (_req, res) => {
  const ok = await healthCheck();
  res.status(ok ? 200 : 503).json({ status: ok ? 'healthy' : 'unhealthy' });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info('RSCI Backend started on port ' + env.PORT + ' (' + env.NODE_ENV + ')');
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down');
  server.close();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down');
  server.close();
  await pool.end();
  process.exit(0);
});

export default app;