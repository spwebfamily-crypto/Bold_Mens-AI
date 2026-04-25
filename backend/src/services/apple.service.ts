import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';

const appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export async function verifyAppleIdentityToken(identityToken: string) {
  const { payload } = await jwtVerify(identityToken, appleJwks, {
    issuer: 'https://appleid.apple.com',
    audience: env.iosBundleIdentifier,
  });

  return {
    appleUserId: String(payload.sub),
    email: typeof payload.email === 'string' ? payload.email : undefined,
  };
}
