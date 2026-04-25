import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error.status === 'number' ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';

  res.status(status).json({
    error: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    message: env.nodeEnv === 'production' && status >= 500 ? 'Unexpected server error' : message,
  });
};
