import { create } from 'zustand';
import type { Plan } from '@/types';

interface SubscriptionState {
  plan: Plan;
  isPurchasing: boolean;
  expiresAt?: string;
  setPlan: (plan: Plan, expiresAt?: string) => void;
  setPurchasing: (isPurchasing: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plan: 'free',
  isPurchasing: false,
  setPlan: (plan, expiresAt) => set({ plan, expiresAt }),
  setPurchasing: (isPurchasing) => set({ isPurchasing }),
}));
