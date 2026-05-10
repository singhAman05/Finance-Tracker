import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import loginRoute from './routes/route_auth';
import billRoute from './routes/route_bills';
import budgetRoute from './routes/route_budgets';
import profileRoute from './routes/route_profile';
import accountsRoute from './routes/route_accounts';
import categoryRoute from './routes/route_categories';
import transactionRoute from './routes/route_transactions';
import settingsRoute from './routes/route_settings';

import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectRedis } from './config/redisClient';
import { appConfig, APP_PROFILE } from './config/appConfig';
import { startScheduler } from './services/service_scheduler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = appConfig.server.cors.allowedOrigins;
const normalizeOrigin = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
};

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.info('request_completed', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: appConfig.server.helmet.contentSecurityPolicy.defaultSrc,
      scriptSrc: appConfig.server.helmet.contentSecurityPolicy.scriptSrc,
      styleSrc: appConfig.server.helmet.contentSecurityPolicy.styleSrc,
      imgSrc: appConfig.server.helmet.contentSecurityPolicy.imgSrc,
      connectSrc: appConfig.server.helmet.contentSecurityPolicy.connectSrc,
    },
  },
}));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalizedIncomingOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedIncomingOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${normalizedIncomingOrigin}`));
    },
    credentials: appConfig.server.cors.credentials,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: appConfig.server.jsonBodyLimit }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);

app.use('/api/auth', loginRoute);

app.use('/api/profile', profileRoute);
app.use('/api/accounts', accountsRoute);
app.use('/api/category', categoryRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/budgets', budgetRoute);
app.use('/api/bills', billRoute);
app.use('/api/settings', settingsRoute);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = appConfig.server.port;

async function bootstrap() {
  logger.setLevel(appConfig.logger.level);
  await connectRedis();
  startScheduler();
  server.listen(PORT, () => {
    logger.info('server_started', { port: PORT, profile: APP_PROFILE, allowedOrigins });
  });
}

let isShuttingDown = false;
function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.warn('shutdown_initiated', { signal });

  server.close(() => {
    logger.info('server_stopped');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('shutdown_forced_timeout');
    process.exit(1);
  }, appConfig.server.shutdownTimeoutMs).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', { reason: String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('uncaught_exception', { message: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

bootstrap().catch((err) => {
  logger.error('bootstrap_failed', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
