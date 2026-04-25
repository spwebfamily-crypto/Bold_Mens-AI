import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { analysisRouter } from './routes/analysis.js';
import { authRouter } from './routes/auth.js';
import { subscriptionRouter } from './routes/subscription.js';
import { trendsRouter } from './routes/trends.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'boldmens-ai-api',
    model: 'claude-sonnet-4-20250514',
    date: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/trends', trendsRouter);
app.use(errorHandler);

async function bootstrap() {
  const results = await Promise.allSettled([connectDatabase(), connectRedis()]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn(result.reason);
    }
  }

  app.listen(env.port, () => {
    console.log(`BoldMens AI API listening on port ${env.port}`);
  });
}

if (env.nodeEnv !== 'test') {
  void bootstrap();
}
