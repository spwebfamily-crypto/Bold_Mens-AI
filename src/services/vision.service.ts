import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { HAIR_ANALYSIS_SYSTEM_PROMPT, buildHairAnalysisUserPrompt } from '../prompts/hairAnalysisPrompt';
import { VisionResult } from '../types';
import { logger } from '../utils/logger';

const hairAnalysisSchema = z.object({
  faceShape: z.enum(['oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle', 'unknown']),
  hairType: z.object({
    texture: z.enum(['straight', 'wavy', 'curly', 'coily', 'afro']),
    typeCode: z.enum(['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', 'unknown']),
    density: z.enum(['fine', 'medium', 'thick']),
    porosity: z.enum(['low', 'normal', 'high']),
  }),
  hairCondition: z.object({
    moisture: z.enum(['dry', 'normal', 'oily']),
    damage: z.enum(['none', 'mild', 'moderate', 'severe']),
    scalpCondition: z.enum(['normal', 'dry', 'oily', 'dandruff_visible']),
  }),
  currentLength: z.enum(['bald', 'buzz', 'short', 'medium', 'long']),
  facialFeatures: z.object({
    beard: z.boolean(),
    beardStyle: z.string().nullable().optional(),
    foreheadSize: z.enum(['small', 'medium', 'large']),
    jawlineDefinition: z.enum(['soft', 'defined', 'strong']),
  }),
  confidence: z.number().min(0).max(1),
  additionalNotes: z.string(),
});

const visionErrorSchema = z.object({
  error: z.enum(['IMAGE_QUALITY_TOO_LOW', 'NO_FACE_DETECTED', 'ANALYSIS_FAILED']),
  reason: z.string(),
});

function extractText(content: unknown): string {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .filter((item): item is { type: string; text?: string } => typeof item === 'object' && item !== null && 'type' in item)
    .filter((item) => item.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Vision request timed out after ${timeoutMs} ms`)), timeoutMs);
    }),
  ]);
}

async function getAnthropicClient(): Promise<Anthropic> {
  const { env } = await import('../config/env');
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export async function analyzeHairFromImage(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
): Promise<VisionResult> {
  const startedAt = Date.now();

  try {
    const client = await getAnthropicClient();
    const response = await withTimeout(
      client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        system: HAIR_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: buildHairAnalysisUserPrompt('pt'),
              },
            ],
          },
        ],
      }),
      45000,
    );

    const rawText = extractText(response.content);
    const parsedJson = JSON.parse(rawText);

    const visionError = visionErrorSchema.safeParse(parsedJson);
    if (visionError.success) {
      logger.info('Vision analysis returned controlled error', {
        processingTimeMs: Date.now() - startedAt,
        error: visionError.data.error,
      });
      return visionError.data;
    }

    const analysis = hairAnalysisSchema.parse(parsedJson);
    logger.info('Vision analysis completed', {
      processingTimeMs: Date.now() - startedAt,
      confidence: analysis.confidence,
    });
    return analysis;
  } catch (error) {
    logger.error('Vision analysis failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: Date.now() - startedAt,
    });

    return {
      error: 'ANALYSIS_FAILED',
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
