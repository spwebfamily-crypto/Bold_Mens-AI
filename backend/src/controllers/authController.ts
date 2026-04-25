import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { User, type UserDocument } from '../models/User.js';
import { verifyAppleIdentityToken } from '../services/apple.service.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  timezone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  timezone: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(16),
});

const appleSchema = z.object({
  identityToken: z.string().min(16),
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  timezone: z.string().optional(),
});

function publicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    plan: user.plan,
    revenueCatUserId: user.revenueCatUserId,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    totalAnalyses: user.totalAnalyses,
    timezone: user.timezone,
  };
}

async function issueAuth(user: UserDocument) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });

  if (existing) {
    return res.status(409).json({ error: 'EMAIL_ALREADY_USED' });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = new User({
    email: data.email,
    passwordHash,
    name: data.name,
    plan: 'free',
    revenueCatUserId: '',
    timezone: data.timezone ?? 'Europe/Lisbon',
  });

  await user.save();
  return res.status(201).json(await issueAuth(user));
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash +refreshTokenHash');

  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  const matches = await bcrypt.compare(data.password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  if (data.timezone) {
    user.timezone = data.timezone;
  }

  return res.json(await issueAuth(user));
}

export async function refresh(req: Request, res: Response) {
  const data = refreshSchema.parse(req.body);
  const payload = verifyRefreshToken(data.refreshToken);
  const user = await User.findById(payload.sub).select('+refreshTokenHash');

  if (!user || user.refreshTokenHash !== hashToken(data.refreshToken)) {
    return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
  }

  return res.json(await issueAuth(user));
}

export async function signInWithApple(req: Request, res: Response) {
  const data = appleSchema.parse(req.body);
  const verified = await verifyAppleIdentityToken(data.identityToken);
  const email = verified.email ?? data.email;

  if (!email) {
    return res.status(400).json({ error: 'APPLE_EMAIL_REQUIRED' });
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = new User({
      email,
      passwordHash: await bcrypt.hash(`apple:${verified.appleUserId}`, 12),
      name: data.name ?? 'BoldMens User',
      plan: 'free',
      revenueCatUserId: verified.appleUserId,
      timezone: data.timezone ?? 'Europe/Lisbon',
    });
  } else {
    user.revenueCatUserId = user.revenueCatUserId || verified.appleUserId;
    if (data.timezone) {
      user.timezone = data.timezone;
    }
  }

  await user.save();
  return res.json(await issueAuth(user));
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  return res.json({ user: publicUser(req.user) });
}

export async function logout(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  req.user.refreshTokenHash = undefined;
  await req.user.save();
  return res.status(204).send();
}
