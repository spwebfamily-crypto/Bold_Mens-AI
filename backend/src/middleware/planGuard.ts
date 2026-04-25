import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { DailyUsage } from '../models/DailyUsage.js';
import { getNextMidnight, getTodayKey, normaliseTimezone } from '../utils/dateUtils.js';
import { getAnalysisLimit, hasReachedAnalysisLimit } from '../utils/limits.js';

export async function planGuard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const timezone = normaliseTimezone(req.header('x-timezone') ?? user.timezone);
  const today = getTodayKey(timezone);
  const resetAt = getNextMidnight(timezone);
  const usage = await DailyUsage.findOne({
    userId: user._id,
    date: today,
  });

  const count = usage?.analysisCount ?? 0;
  const limit = getAnalysisLimit(user.plan, env.freeDailyLimit);

  if (hasReachedAnalysisLimit(user.plan, count, env.freeDailyLimit)) {
    return res.status(429).json({
      error: 'DAILY_LIMIT_REACHED',
      limit,
      used: count,
      plan: user.plan,
      resetAt,
      upgradeRequired: user.plan === 'free',
    });
  }

  await DailyUsage.findOneAndUpdate(
    { userId: user._id, date: today },
    {
      $inc: { analysisCount: 1 },
      $setOnInsert: { resetAt },
    },
    { upsert: true, new: true },
  );

  req.timezone = timezone;
  return next();
}
