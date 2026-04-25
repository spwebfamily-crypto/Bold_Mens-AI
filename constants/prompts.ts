import Constants from 'expo-constants';

export const freeDailyLimit =
  Number(Constants.expoConfig?.extra?.freeDailyLimit ?? process.env.EXPO_PUBLIC_FREE_DAILY_LIMIT) || 3;
