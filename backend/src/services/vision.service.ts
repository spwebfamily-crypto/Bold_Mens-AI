import Anthropic from '@anthropic-ai/sdk';
import type { Plan, StructuredAnalysis } from '../types/domain.js';
import { env } from '../config/env.js';
import { buildDefaultStructuredAnalysis } from './recommendation.service.js';

export const ANTHROPIC_VISION_MODEL = 'claude-sonnet-4-20250514';

interface AnalyzeSelfieInput {
  imageBase64: string;
  mimeType: string;
  plan: Plan;
  onText: (chunk: string) => void;
}

async function streamMockAnalysis(plan: Plan, onText: (chunk: string) => void) {
  const chunks = [
    'Analisei a selfie e foquei-me no formato do rosto, textura do cabelo e potencial de manutencao. ',
    'A melhor direcao e um corte com laterais limpas e topo com textura natural. ',
    'Para ti, o Fade Medio com Textura e a opcao mais equilibrada: moderno, versatil e facil de ajustar ao dia a dia.',
  ];

  for (const chunk of chunks) {
    onText(chunk);
  }

  return buildDefaultStructuredAnalysis(plan);
}

export async function analyzeSelfie(input: AnalyzeSelfieInput): Promise<StructuredAnalysis> {
  if (!env.anthropicApiKey) {
    return streamMockAnalysis(input.plan, input.onText);
  }

  const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });
  const stream = await anthropic.messages.create({
    model: ANTHROPIC_VISION_MODEL,
    max_tokens: 1600,
    temperature: 0.3,
    stream: true,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: input.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: input.imageBase64,
            },
          },
          {
            type: 'text',
            text:
              'Analisa esta selfie para uma app masculina de cortes de cabelo. Responde em portugues europeu, em tom direto e premium, com 3 a 5 frases. Considera formato do rosto, tipo/condicao do cabelo, corte recomendado, manutencao, produtos e tendencias atuais. Nao menciones incertezas tecnicas.',
          },
        ],
      },
    ],
  });

  let streamedText = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      streamedText += event.delta.text;
      input.onText(event.delta.text);
    }
  }

  return {
    ...buildDefaultStructuredAnalysis(input.plan),
    recommendations: {
      ...buildDefaultStructuredAnalysis(input.plan).recommendations,
      haircut: {
        ...buildDefaultStructuredAnalysis(input.plan).recommendations.haircut,
        reason:
          streamedText.trim() ||
          buildDefaultStructuredAnalysis(input.plan).recommendations.haircut.reason,
      },
    },
  };
}
