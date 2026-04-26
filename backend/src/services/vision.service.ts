import type { Plan, StructuredAnalysis } from '../types/domain.js';
import { env } from '../config/env.js';
import { buildDefaultStructuredAnalysis } from './recommendation.service.js';
import { analyzeSelfieWithOpenAI } from './openai.service.js';

export const OPENAI_VISION_MODEL = env.openaiModel;

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
    'Inclui tambem referencias visuais da BoldMens para mostrares ao barbeiro e alinhar o acabamento.',
  ];

  for (const chunk of chunks) {
    onText(chunk);
  }

  return buildDefaultStructuredAnalysis(plan);
}

function createAnalysisUnavailableError(message: string, cause?: unknown) {
  const error = Object.assign(
    new Error(message),
    {
      code: 'AI_ANALYSIS_UNAVAILABLE',
      status: 503,
      cause,
    },
  );

  return error;
}

function streamSummary(summary: string, onText: (chunk: string) => void) {
  const chunks = summary.match(/[^.!?]+[.!?]\s*/g) ?? [summary];
  for (const chunk of chunks) {
    onText(chunk);
  }
}

export async function analyzeSelfie(input: AnalyzeSelfieInput): Promise<StructuredAnalysis> {
  if (!env.openaiApiKey) {
    if (env.allowMockAnalysis && env.nodeEnv !== 'production') {
      return streamMockAnalysis(input.plan, input.onText);
    }

    throw createAnalysisUnavailableError(
      'Analise real indisponivel. Configura OPENAI_API_KEY para analisar a selfie sem usar recomendacoes fixas.',
    );
  }

  try {
    const { summary, structured } = await analyzeSelfieWithOpenAI({
      imageBase64: input.imageBase64,
      mimeType: input.mimeType,
      plan: input.plan,
    });
    streamSummary(summary, input.onText);
    return structured;
  } catch (error) {
    console.warn('OpenAI selfie analysis failed.', error);
    if (env.allowMockAnalysis && env.nodeEnv !== 'production') {
      return streamMockAnalysis(input.plan, input.onText);
    }

    throw createAnalysisUnavailableError(
      'A IA real nao devolveu uma analise personalizada valida. Verifica OPENAI_MODEL, acesso ao modelo com visao e tenta novamente com uma selfie bem iluminada.',
      error,
    );
  }
}
