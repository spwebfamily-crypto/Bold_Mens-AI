import type { Request, Response } from 'express';
import { getTrendsForUser } from '../services/trends.service.js';
import type { HairType } from '../types/domain.js';

export async function getTrends(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const hairType = typeof req.query.hairType === 'string' ? (req.query.hairType as HairType) : undefined;
  const trends = await getTrendsForUser(req.user.plan, hairType);

  return res.json({
    season: 'Primavera/Verao 2026',
    plan: req.user.plan,
    trends,
  });
}
