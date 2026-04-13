import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import api from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Always-allowed origins (hardcoded production URLs)
const ALWAYS_ALLOWED_ORIGINS = [
  'https://project-joev.vercel.app',
];

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());

  // Build the final allowed origins list
  const envOrigins =
    env.corsOrigin === '*'
      ? []
      : env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);

  const allowedOrigins = [...new Set([...ALWAYS_ALLOWED_ORIGINS, ...envOrigins])];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Fallback: if CORS_ORIGIN is '*', allow everything
        if (env.corsOrigin === '*') return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );
  // Handle OPTIONS preflight for all routes
  app.options('*', cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'agrisupplychain-api' });
  });

  app.use('/api/v1', api);

  app.use(errorHandler);

  return app;
}
