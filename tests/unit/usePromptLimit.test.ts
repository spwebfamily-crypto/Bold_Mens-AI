import { getPromptLimitState } from '@/hooks/usePromptLimit';

describe('getPromptLimitState', () => {
  it('blocks free users after the daily limit', () => {
    const state = getPromptLimitState('free', { used: 3, limit: 3 });

    expect(state.remaining).toBe(0);
    expect(state.isBlocked).toBe(true);
  });

  it('keeps plus users unlimited', () => {
    const state = getPromptLimitState('plus', { used: 99, limit: 3 });

    expect(state.isBlocked).toBe(false);
    expect(state.remaining).toBe(Number.POSITIVE_INFINITY);
  });
});
