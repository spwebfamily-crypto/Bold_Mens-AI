import type { ConfigContext, ExpoConfig } from 'expo/config';

const appJson = require('./app.json');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
    revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
    freeDailyLimit: Number(process.env.EXPO_PUBLIC_FREE_DAILY_LIMIT ?? 3),
  },
});
