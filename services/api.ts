import axios from 'axios';
import Constants from 'expo-constants';
import { clearSession, readSession, saveSession } from './session';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse } from '@/types';

export const API_URL =
  String(Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api');

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

      const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
        refreshToken: session.refreshToken,
      });

      useAuthStore.getState().setAuth(response.data);
      await saveSession(response.data.accessToken, response.data.refreshToken);
      return response.data.accessToken;
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
      const token = await refreshAccessToken();

      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    if (error.response?.status === 401) {
      await clearSession();
      useAuthStore.getState().clearAuth();
    }

    throw error;
  },
);
