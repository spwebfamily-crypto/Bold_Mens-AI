import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserDocument } from '../models/User.js';
import type { Plan } from '../types/domain.js';

export interface AccessTokenPayload {
  sub: string;
  plan: Plan;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export function signAccessToken(user: UserDocument) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      plan: user.plan,
      type: 'access',
    } satisfies AccessTokenPayload,
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    } as SignOptions,
  );
}

export function signRefreshToken(user: UserDocument) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    } satisfies RefreshTokenPayload,
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn,
    } as SignOptions,
  );
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
