import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { validatePurchase, applyRevenueCatWebhook } from '../services/revenuecat.service.js';

export async function getSubscription(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  return res.json({
    plan: req.user.plan,
    revenueCatUserId: req.user.revenueCatUserId,
    subscriptionExpiresAt: req.user.subscriptionExpiresAt,
  });
}

export async function validateSubscription(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  const result = await validatePurchase(req.user._id.toString());
  return res.json(result);
}

export async function revenueCatWebhook(req: Request, res: Response) {
  if (env.revenueCatWebhookAuth) {
    const authHeader = req.header('authorization');
    if (authHeader !== `Bearer ${env.revenueCatWebhookAuth}`) {
      return res.status(401).json({ error: 'INVALID_WEBHOOK_AUTH' });
    }
  }

  const event = req.body?.event;
  const appUserId = event?.app_user_id;
  const expiresAt = event?.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : event?.expires_date;

  if (!appUserId) {
    return res.status(400).json({ error: 'APP_USER_ID_REQUIRED' });
  }

  await applyRevenueCatWebhook(appUserId, expiresAt);
  return res.status(204).send();
}
