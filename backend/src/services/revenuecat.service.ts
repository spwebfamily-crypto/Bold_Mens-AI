import { env, requireConfig } from '../config/env.js';
import { User } from '../models/User.js';

interface RevenueCatEntitlement {
  expires_date?: string | null;
  product_identifier?: string;
}

interface RevenueCatSubscriberResponse {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
  };
}

function isActive(expiresDate?: string | null) {
  if (!expiresDate) {
    return false;
  }

  return new Date(expiresDate).getTime() > Date.now();
}

export async function validatePurchase(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const apiKey = requireConfig('revenueCatApiKey', env.revenueCatApiKey);
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.revenueCatUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw Object.assign(new Error('RevenueCat validation failed'), { status: 502 });
  }

  const payload = (await response.json()) as RevenueCatSubscriberResponse;
  const plus = payload.subscriber?.entitlements?.plus;
  const active = isActive(plus?.expires_date);

  user.plan = active ? 'plus' : 'free';
  user.subscriptionExpiresAt = plus?.expires_date ? new Date(plus.expires_date) : undefined;
  await user.save();

  return {
    valid: active,
    expiresAt: user.subscriptionExpiresAt,
    plan: user.plan,
  };
}

export async function applyRevenueCatWebhook(appUserId: string, expiresAt?: string | null) {
  const active = isActive(expiresAt);

  await User.findOneAndUpdate(
    { revenueCatUserId: appUserId },
    {
      plan: active ? 'plus' : 'free',
      subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : undefined,
    },
  );
}
