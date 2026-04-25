import { useCallback } from 'react';
import * as authService from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const status = useAuthStore((state) => state.status);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    try {
      const session = await authService.bootstrapSession();
      if (session) {
        setAuth(session);
      } else {
        setStatus('anonymous');
      }
    } catch {
      clearAuth();
    }
  }, [clearAuth, setAuth, setStatus]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      setStatus('loading');
      const response = await authService.login(input);
      setAuth(response);
      return response;
    },
    [setAuth, setStatus],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      setStatus('loading');
      const response = await authService.register(input);
      setAuth(response);
      return response;
    },
    [setAuth, setStatus],
  );

  const signInWithApple = useCallback(async () => {
    setStatus('loading');
    const response = await authService.signInWithApple();
    setAuth(response);
    return response;
  }, [setAuth, setStatus]);

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    accessToken,
    refreshToken,
    status,
    bootstrap,
    login,
    register,
    signInWithApple,
    logout,
  };
}
