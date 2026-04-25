import type { Plan } from '@/types';

export const plans: Record<
  Plan,
  {
    label: string;
    price: string;
    analysisLimit: number | 'unlimited';
    historyDays: number;
    features: string[];
  }
> = {
  free: {
    label: 'FREE',
    price: '0 EUR',
    analysisLimit: 3,
    historyDays: 7,
    features: ['3 analises por dia', 'Historico de 7 dias', '3 sugestoes de produtos', 'Tendencias basicas'],
  },
  plus: {
    label: 'PLUS',
    price: '9,99 EUR/mes',
    analysisLimit: 'unlimited',
    historyDays: 365,
    features: [
      'Analises ilimitadas',
      'Historico de 1 ano',
      'Tendencias completas',
      'Rotina diaria personalizada',
      '10+ produtos recomendados',
      'Sem anuncios',
    ],
  },
};

export const plusProductId = 'com.boldmens.plus.monthly';
