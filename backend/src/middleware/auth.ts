import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'INVALID_TOKEN_TYPE' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'USER_NOT_FOUND' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}
