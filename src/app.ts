import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import webhookRoutes from './routes/webhook';

const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: env.BOLDMENS_WEBSITE }));

const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MINUTES, 10) * 60 * 1000,
  max: parseInt(env.RATE_LIMIT_MAX, 10),
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/webhook', limiter);
app.use('/webhook', webhookRoutes);
app.use('/health', healthRoutes);
app.use(errorHandler);

export default app;
