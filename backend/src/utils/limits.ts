import type { Plan } from '../types/domain.js';

export function getAnalysisLimit(plan: Plan, freeDailyLimit: number) {
  return plan === 'plus' ? Number.POSITIVE_INFINITY : freeDailyLimit;
}

export function hasReachedAnalysisLimit(plan: Plan, used: number, freeDailyLimit: number) {
  return used >= getAnalysisLimit(plan, freeDailyLimit);
}
