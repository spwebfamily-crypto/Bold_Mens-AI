import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
  },
});
