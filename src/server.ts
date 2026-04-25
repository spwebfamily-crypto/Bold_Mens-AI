import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');

    app.listen(parseInt(env.PORT, 10), () => {
      logger.info(`BoldMens WhatsApp AI running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info('Webhook route: POST /webhook/whatsapp');
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

void bootstrap();
