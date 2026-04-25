import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  setAuth: (auth: { user: User; accessToken: string; refreshToken: string }) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthState['status']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  setAuth: ({ user, accessToken, refreshToken }) =>
    set({ user, accessToken, refreshToken, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'anonymous',
    }),
}));
