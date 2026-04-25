import OpenAI from 'openai';
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
  confidence: z.coerce.number().min(0).max(1),
  additionalNotes: z.string(),
});

const visionErrorSchema = z.object({
  error: z.enum(['IMAGE_QUALITY_TOO_LOW', 'NO_FACE_DETECTED', 'ANALYSIS_FAILED']),
  reason: z.string(),
});

const visionStructuredResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  analysis: hairAnalysisSchema.nullable(),
  error: z.enum(['IMAGE_QUALITY_TOO_LOW', 'NO_FACE_DETECTED', 'ANALYSIS_FAILED']).nullable(),
  reason: z.string().nullable(),
});

const visionResponseFormat = {
  type: 'json_schema',
  name: 'hair_analysis_result',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      status: { type: 'string', enum: ['ok', 'error'] },
      analysis: {
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              faceShape: { type: 'string', enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle', 'unknown'] },
              hairType: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  texture: { type: 'string', enum: ['straight', 'wavy', 'curly', 'coily', 'afro'] },
                  typeCode: { type: 'string', enum: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', 'unknown'] },
                  density: { type: 'string', enum: ['fine', 'medium', 'thick'] },
                  porosity: { type: 'string', enum: ['low', 'normal', 'high'] },
                },
                required: ['texture', 'typeCode', 'density', 'porosity'],
              },
              hairCondition: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  moisture: { type: 'string', enum: ['dry', 'normal', 'oily'] },
                  damage: { type: 'string', enum: ['none', 'mild', 'moderate', 'severe'] },
                  scalpCondition: { type: 'string', enum: ['normal', 'dry', 'oily', 'dandruff_visible'] },
                },
                required: ['moisture', 'damage', 'scalpCondition'],
              },
              currentLength: { type: 'string', enum: ['bald', 'buzz', 'short', 'medium', 'long'] },
              facialFeatures: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  beard: { type: 'boolean' },
                  beardStyle: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  foreheadSize: { type: 'string', enum: ['small', 'medium', 'large'] },
                  jawlineDefinition: { type: 'string', enum: ['soft', 'defined', 'strong'] },
                },
                required: ['beard', 'beardStyle', 'foreheadSize', 'jawlineDefinition'],
              },
              confidence: { type: 'number' },
              additionalNotes: { type: 'string' },
            },
            required: ['faceShape', 'hairType', 'hairCondition', 'currentLength', 'facialFeatures', 'confidence', 'additionalNotes'],
          },
          { type: 'null' },
        ],
      },
      error: {
        anyOf: [
          { type: 'string', enum: ['IMAGE_QUALITY_TOO_LOW', 'NO_FACE_DETECTED', 'ANALYSIS_FAILED'] },
          { type: 'null' },
        ],
      },
      reason: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
    },
    required: ['status', 'analysis', 'error', 'reason'],
  },
} as const;

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

function extractJsonCandidate(rawText: string): string {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new Error('Vision model returned empty text content');
  }

  const withoutCodeFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    JSON.parse(withoutCodeFences);
    return withoutCodeFences;
  } catch {
    const firstBrace = withoutCodeFences.indexOf('{');
    const lastBrace = withoutCodeFences.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('Vision model did not return a valid JSON object');
    }

    return withoutCodeFences.slice(firstBrace, lastBrace + 1);
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Vision request timed out after ${timeoutMs} ms`)), timeoutMs);
    }),
  ]);
}

async function getOpenAIClient(): Promise<OpenAI> {
  const { env } = await import('../config/env');
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export async function analyzeHairFromImage(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
): Promise<VisionResult> {
  const startedAt = Date.now();

  try {
    const client = await getOpenAIClient();
    const response = await withTimeout(
      client.responses.create({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: HAIR_ANALYSIS_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                detail: 'auto',
                image_url: `data:${mimeType};base64,${imageBase64}`,
              },
              {
                type: 'input_text',
                text: buildHairAnalysisUserPrompt('pt'),
              },
            ],
          },
        ],
        text: {
          format: visionResponseFormat,
        },
      }),
      45000,
    );

    const parsed = visionStructuredResponseSchema.parse(JSON.parse(extractJsonCandidate(response.output_text)));

    if (parsed.status === 'error') {
      const visionError = visionErrorSchema.parse({
        error: parsed.error ?? 'ANALYSIS_FAILED',
        reason: parsed.reason ?? 'Unknown analysis error',
      });
      logger.info('Vision analysis returned controlled error', {
        processingTimeMs: Date.now() - startedAt,
        error: visionError.error,
      });
      return visionError;
    }

    const analysis = hairAnalysisSchema.parse(parsed.analysis);
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
