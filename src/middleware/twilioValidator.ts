import { NextFunction, Request, Response } from 'express';
import twilio from 'twilio';
import { env } from '../config/env';
import { logger } from '../utils/logger';

function getRequestUrl(req: Request): string {
  const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}${req.originalUrl}`;
}

export function validateTwilioSignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.header('X-Twilio-Signature') ?? '';
  const requestIsValid = twilio.validateRequest(
    env.TWILIO_AUTH_TOKEN,
    signature,
    getRequestUrl(req),
    req.body,
  );

  if (requestIsValid) {
    next();
    return;
  }

  if (env.NODE_ENV === 'development') {
    logger.warn('Invalid Twilio signature accepted in development', {
      url: getRequestUrl(req),
    });
    next();
    return;
  }

  logger.warn('Blocked request with invalid Twilio signature', {
    url: getRequestUrl(req),
  });
  res.status(403).json({ error: 'Invalid Twilio signature' });
}
