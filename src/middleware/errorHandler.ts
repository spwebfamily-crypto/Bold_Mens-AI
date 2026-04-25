import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled application error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof mongoose.Error) {
    res.status(503).json({
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.flatten(),
    });
    return;
  }

  if (error instanceof Error && error.name.toLowerCase().includes('openai')) {
    res.status(502).json({
      error: 'AI provider error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
