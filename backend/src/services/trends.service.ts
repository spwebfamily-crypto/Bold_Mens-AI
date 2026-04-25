import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { getRedis } from '../config/redis.js';
import type { HairType, Plan, Trend } from '../types/domain.js';
import { staticTrends, TREND_SEASON, trendsForPlan } from './recommendation.service.js';

const MODEL = 'claude-sonnet-4-20250514';
const CACHE_SECONDS = 60 * 60 * 24;

function parseTrendJson(text: string): Trend[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]) as Trend[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function generateTrendsWithAi(hairType?: HairType) {
  if (!env.anthropicApiKey) {
    return staticTrends;
  }

  const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    temperature: 0.4,
    messages: [
      {
        role: 'user',
        content: `Gera 10 tendencias masculinas de cabelo para ${TREND_SEASON}. ${hairType ? `Foca tambem no tipo ${hairType}.` : ''} Responde apenas com JSON array. Campos: id, name, season, description, idealHairTypes, maintenance, source, plusOnly.`,
      },
    ],
  });

  const text = message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n');

  return parseTrendJson(text) ?? staticTrends;
}

export async function getTrendsForUser(plan: Plan, hairType?: HairType) {
  const cacheKey = `trends:${TREND_SEASON}:${hairType ?? 'all'}`;
  const redis = getRedis();

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const all = JSON.parse(cached) as Trend[];
      return plan === 'plus' ? all : all.slice(0, 3);
    }
  }

  const all = await generateTrendsWithAi(hairType);

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(all), 'EX', CACHE_SECONDS);
  }

  return plan === 'plus' ? all : trendsForPlan('free');
}
