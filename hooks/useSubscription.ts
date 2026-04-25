import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  configurePurchases,
  fetchSubscription,
  purchasePlus,
  restorePurchases,
} from '@/services/subscription.service';

export function useSubscription() {
  const user = useAuthStore((state) => state.user);
  const store = useSubscriptionStore();

  useEffect(() => {
    void configurePurchases(user);
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) {
      return null;
    }

    const subscription = await fetchSubscription();
    store.setPlan(subscription.plan, subscription.subscriptionExpiresAt);
    return subscription;
  }, [store, user]);

  const buyPlus = useCallback(async () => {
    store.setPurchasing(true);
    try {
      const result = await purchasePlus();
      store.setPlan(result.plan, result.expiresAt);
      return result;
    } finally {
      store.setPurchasing(false);
    }
  }, [store]);

  const restore = useCallback(async () => {
    store.setPurchasing(true);
    try {
      const result = await restorePurchases();
      store.setPlan(result.plan, result.expiresAt);
      return result;
    } finally {
      store.setPurchasing(false);
    }
  }, [store]);

  return {
    ...store,
    refresh,
    buyPlus,
    restore,
  };
}
