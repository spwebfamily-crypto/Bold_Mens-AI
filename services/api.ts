import axios from 'axios';
import Constants from 'expo-constants';
import { clearSession, readSession, saveSession } from './session';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse } from '@/types';

function inferLanApiUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.debuggerHost;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return `http://${host}:3000/api`;
}

function resolveApiUrl() {
  const configured = String(Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? '');
  
  // Se estivermos em desenvolvimento e no mobile, o IP da LAN é essencial
  if (__DEV__) {
    const lanUrl = inferLanApiUrl();
    if (lanUrl) return lanUrl;
  }

  const fallback = configured || 'http://192.168.1.9:3000/api';

  if (fallback.includes('localhost') || fallback.includes('127.0.0.1')) {
    return inferLanApiUrl() ?? fallback.replace('localhost', '192.168.1.9');
  }

  return fallback;
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken ?? (await readSession()).accessToken;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['x-timezone'] = timezone;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = await readSession();
      if (!session.refreshToken) {
        return null;
      }

      try {
        const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
          refreshToken: session.refreshToken,
        });

        useAuthStore.getState().setAuth(response.data);
        await saveSession(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      } catch (error) {
        console.error('[refreshAccessToken] Error:', error);
        // Limpa sessão se o refresh falhar
        await clearSession();
        useAuthStore.getState().clearAuth();
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch (refreshError) {
        console.error('[API] Refresh token failed:', refreshError);
      }
    }

    if (error.response?.status === 401) {
      await clearSession();
      useAuthStore.getState().clearAuth();
      // Redireciona para tela de login após limpar sessão
      const router = (await import('expo-router')).router;
      if (router.canGoBack() || true) {
        router.replace('/(auth)/login');
      }
    }

    throw error;
  },
);
