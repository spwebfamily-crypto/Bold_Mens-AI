import type { Plan, PromptUsage } from '@/types';
import { freeDailyLimit } from '@/constants/prompts';

export function getPromptLimitState(plan: Plan, usage?: Partial<PromptUsage>) {
  if (plan === 'plus') {
    return {
      limit: Number.POSITIVE_INFINITY,
      used: usage?.used ?? 0,
      remaining: Number.POSITIVE_INFINITY,
      isBlocked: false,
      label: 'Analises ilimitadas',
    };
  }

  const limit = usage?.limit ?? freeDailyLimit;
  const used = usage?.used ?? 0;
  const remaining = Math.max(limit - used, 0);

  return {
    limit,
    used,
    remaining,
    isBlocked: remaining <= 0,
    label: `${remaining} de ${limit} analises restantes hoje`,
  };
}

export function usePromptLimit(plan: Plan, usage?: Partial<PromptUsage>) {
  return getPromptLimitState(plan, usage);
}
