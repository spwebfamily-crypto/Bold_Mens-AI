import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      error: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
    });
  }

  const status = typeof error.status === 'number' ? error.status : 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';

  res.status(status).json({
    error: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    message: env.nodeEnv === 'production' && status >= 500 ? 'Unexpected server error' : message,
  });
};
