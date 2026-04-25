import { api } from './api';
import type { Trend } from '@/types';

export async function fetchTrends() {
  const response = await api.get<{ season: string; trends: Trend[] }>('/trends');
  return response.data;
}
