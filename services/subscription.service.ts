import Constants from 'expo-constants';
import { api } from './api';
import type { Plan, User } from '@/types';

let configuredForUser: string | null = null;

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesOffering = Awaited<ReturnType<PurchasesModule['default']['getOfferings']>>['current'];

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

async function loadPurchases() {
  if (isExpoGo()) {
    throw new Error('REVENUECAT_REQUIRES_DEV_BUILD');
  }

  return import('react-native-purchases');
}

export async function configurePurchases(user?: User | null) {
  const apiKey = String(
    Constants.expoConfig?.extra?.revenueCatIosKey ?? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  );

  if (isExpoGo() || !apiKey || !user || configuredForUser === user.revenueCatUserId) {
    return;
  }

  const { default: Purchases, LOG_LEVEL } = await loadPurchases();
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({
    apiKey,
    appUserID: user.revenueCatUserId,
  });
  configuredForUser = user.revenueCatUserId;
}

export async function getPlusOffering(): Promise<PurchasesOffering | null> {
  const { default: Purchases } = await loadPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePlus() {
  const { default: Purchases } = await loadPurchases();
  const offering = await getPlusOffering();
  const monthly = offering?.availablePackages.find((pkg) =>
    pkg.product.identifier.includes('plus.monthly'),
  );

  if (!monthly) {
    throw new Error('PLUS_PACKAGE_NOT_AVAILABLE');
  }

  await Purchases.purchasePackage(monthly);
  const response = await api.post<{ valid: boolean; plan: Plan; expiresAt?: string }>('/subscription/validate');
  return response.data;
}

export async function restorePurchases() {
  const { default: Purchases } = await loadPurchases();
  await Purchases.restorePurchases();
  const response = await api.post<{ valid: boolean; plan: Plan; expiresAt?: string }>('/subscription/validate');
  return response.data;
}

export async function fetchSubscription() {
  const response = await api.get<{ plan: Plan; subscriptionExpiresAt?: string }>('/subscription');
  return response.data;
}
