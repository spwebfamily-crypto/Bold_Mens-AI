import { AxiosError } from 'axios';
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
  const refreshedSession = await readSession();
  return {
    user: response.data.user,
    accessToken: refreshedSession.accessToken ?? session.accessToken,
    refreshToken: refreshedSession.refreshToken ?? session.refreshToken ?? '',
  };
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    await clearSession();
  }
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return 'O servidor demorou muito a responder. Verifica a tua ligação à internet.';
    }
    
    if (!error.response) {
      return 'Não foi possível ligar ao servidor. Verifica se estás online.';
    }

    const code = error.response?.data?.error;
    const issues = error.response?.data?.issues as { path?: string; message?: string }[] | undefined;

    if (code === 'EMAIL_ALREADY_USED') {
      return 'Este email já está registado. Tenta entrar na tua conta ou usa outro email.';
    }

    if (code === 'INVALID_CREDENTIALS') {
      return 'Email ou password incorretos. Tenta novamente.';
    }

    if (code === 'USER_NOT_FOUND') {
      return 'Não encontrámos nenhuma conta com este email.';
    }

    if (code === 'VALIDATION_ERROR' && issues?.length) {
      const passwordIssue = issues.find((issue) => issue.path === 'password');
      if (passwordIssue) {
        return 'A password deve ser mais forte (mínimo 8 caracteres).';
      }
      return 'Confirma se todos os campos estão preenchidos corretamente.';
    }

    if (error.response.status === 429) {
      return 'Demasiadas tentativas. Por favor, aguarda um pouco antes de tentar novamente.';
    }
  }

  return fallback;
}
