import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const candidates = [
  process.env.DOTENV_CONFIG_PATH,
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
].filter(Boolean) as string[];

for (const path of candidates) {
  if (existsSync(path)) {
    dotenv.config({ path, override: false });
  }
}

const read = (key: string, fallback = '') => process.env[key] ?? fallback;
const readNumber = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const env = {
  nodeEnv: read('NODE_ENV', 'development'),
  port: readNumber('PORT', 3000),
  websiteUrl: read('BOLDMENS_WEBSITE', 'https://boldmens.co'),
  apiBaseUrl: read('API_BASE_URL', 'http://localhost:3000'),
  iosBundleIdentifier: read('IOS_BUNDLE_IDENTIFIER', 'co.boldmens.ai'),
  freeDailyLimit: readNumber('FREE_DAILY_LIMIT', 3),
  corsOrigins: read('CORS_ORIGINS', 'https://boldmens.co,http://localhost:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  anthropicApiKey: read('ANTHROPIC_API_KEY'),
  mongodbUri: read('MONGODB_URI'),
  redisUrl: read('REDIS_URL'),

  jwtSecret: read('JWT_SECRET', 'development-access-secret-change-me'),
  jwtRefreshSecret: read('JWT_REFRESH_SECRET', 'development-refresh-secret-change-me'),
  jwtExpiresIn: read('JWT_EXPIRES_IN', '15m'),
  jwtRefreshExpiresIn: read('JWT_REFRESH_EXPIRES_IN', '30d'),

  cloudinaryCloudName: read('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: read('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: read('CLOUDINARY_API_SECRET'),

  revenueCatApiKey: read('REVENUECAT_API_KEY'),
  revenueCatWebhookAuth: read('REVENUECAT_WEBHOOK_AUTH'),
};

export function requireConfig(name: keyof typeof env, value: string): string {
  if (!value) {
    throw new Error(`Missing required configuration: ${String(name)}`);
  }

  return value;
}
