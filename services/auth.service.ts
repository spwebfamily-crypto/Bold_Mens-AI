import { api } from './api';
import { clearSession, readSession, saveSession } from './session';
import type { AuthResponse, User } from '@/types';

export async function register(input: { name: string; email: string; password: string }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.post<AuthResponse>('/auth/register', { ...input, timezone });
  await saveSession(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function login(input: { email: string; password: string }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.post<AuthResponse>('/auth/login', { ...input, timezone });
  await saveSession(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function signInWithApple() {
  const AppleAuthentication = await import('expo-apple-authentication');
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('APPLE_IDENTITY_TOKEN_MISSING');
  }

  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.post<AuthResponse>('/auth/apple', {
    identityToken: credential.identityToken,
    email: credential.email ?? undefined,
    name: fullName || undefined,
    timezone,
  });

  await saveSession(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function bootstrapSession() {
  const session = await readSession();
  if (!session.accessToken) {
    return null;
  }

  const response = await api.get<{ user: User }>('/auth/me');
  return {
    user: response.data.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? '',
  };
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    await clearSession();
  }
}
