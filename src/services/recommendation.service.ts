import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { haircuts } from '../data/haircuts';
import { products } from '../data/products';
import { buildRecommendationSystemPrompt } from '../prompts/recommendationPrompt';
import { HairAnalysis, Haircut, Language, Product, Recommendations } from '../types';
import { logger } from '../utils/logger';

const recommendationResponseSchema = z.object({
  selectedHaircutIds: z.array(z.string()).length(3),
  selectedProductIds: z.array(z.string()).min(3).max(5),
  routine: z.array(z.string()).length(5),
  summary: z.string().min(1),
});

function isStyler(product: Product): boolean {
  return ['styling_cream', 'pomade', 'wax', 'gel'].includes(product.category);
}

function scoreHaircut(haircut: Haircut, analysis: HairAnalysis): number {
  let score = haircut.popularityScore;

  if (haircut.suitableFaceShapes.includes(analysis.faceShape)) {
    score += 30;
  }

  if (haircut.suitableHairTypes.includes(analysis.hairType.typeCode)) {
    score += 35;
  }

  if (haircut.boldMensSpecialty) {
    score += 8;
  }

  if (haircut.avoidForHairTypes.includes(analysis.hairType.typeCode)) {
    score -= 100;
  }

  return score;
}

function scoreProduct(product: Product, analysis: HairAnalysis): number {
  let score = 0;

  if (
    product.suitableFor.includes(analysis.hairType.typeCode) ||
    product.suitableFor.includes(analysis.hairType.texture) ||
    (analysis.facialFeatures.beard && product.suitableFor.includes('beard'))
  ) {
    score += 25;
  }

  if (
    product.hairConditions.includes(analysis.hairCondition.moisture) ||
    product.hairConditions.includes(analysis.hairCondition.damage) ||
    product.hairConditions.includes(analysis.hairCondition.scalpCondition)
  ) {
    score += 20;
  }

  if (product.dailyUse) {
    score += 6;
  }

  if (analysis.hairType.typeCode >= '3A' && ['leave_in', 'oil', 'styling_cream', 'conditioner'].includes(product.category)) {
    score += 12;
  }

  if (analysis.facialFeatures.beard && product.category.startsWith('beard_')) {
    score += 18;
  }

  return score;
}

function buildFallbackRoutine(analysis: HairAnalysis, language: Language): string[] {
  if (language === 'en') {
    return [
      'Wash with the recommended shampoo based on your scalp condition.',
      'Apply conditioner or leave-in through the mid-lengths and ends.',
      'Use a styling product that matches your texture for control and shape.',
      analysis.facialFeatures.beard
        ? 'Hydrate the beard with oil or balm and brush it into place.'
        : 'Finish with a light serum or oil if the hair feels dry.',
      'Book a visit at Bold Men\'s for a sharper custom finish and maintenance plan.',
    ];
  }

  return [
    'Lava com o shampoo recomendado de acordo com o teu couro cabeludo.',
    'Aplica condicionador ou leave-in no comprimento e nas pontas.',
    'Usa um produto de styling adequado a tua textura para controlo e forma.',
    analysis.facialFeatures.beard
      ? 'Hidrata a barba com oleo ou balm e penteia para alinhar.'
      : 'Finaliza com serum ou oleo leve se o cabelo estiver seco.',
    'Marca visita na Bold Men\'s para um acabamento mais preciso e plano de manutencao.',
  ];
}

async function getAnthropicClient(): Promise<Anthropic> {
  const { env } = await import('../config/env');
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

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

export function filterCompatibleHaircuts(analysis: HairAnalysis): Haircut[] {
  return [...haircuts]
    .filter((haircut) => !haircut.avoidForHairTypes.includes(analysis.hairType.typeCode))
    .sort((a, b) => scoreHaircut(b, analysis) - scoreHaircut(a, analysis));
}

export function filterCompatibleProducts(analysis: HairAnalysis): Product[] {
  const ranked = [...products].sort((a, b) => scoreProduct(b, analysis) - scoreProduct(a, analysis));
  const selected: Product[] = [];

  const shampoo = ranked.find((product) => product.category === 'shampoo');
  const styler = ranked.find((product) => isStyler(product));
  const beard = analysis.facialFeatures.beard
    ? ranked.find((product) => product.category.startsWith('beard_'))
    : undefined;

  for (const candidate of [shampoo, styler, beard]) {
    if (candidate && !selected.includes(candidate)) {
      selected.push(candidate);
    }
  }

  for (const product of ranked) {
    if (!selected.includes(product)) {
      selected.push(product);
    }
  }

  return selected;
}

function buildFallbackRecommendations(analysis: HairAnalysis, language: Language): Recommendations {
  const compatibleHaircuts = filterCompatibleHaircuts(analysis).slice(0, 3);
  const compatibleProducts = filterCompatibleProducts(analysis);

  const shampoo = compatibleProducts.find((product) => product.category === 'shampoo');
  const styler = compatibleProducts.find((product) => isStyler(product));
  const beard = analysis.facialFeatures.beard
    ? compatibleProducts.find((product) => product.category.startsWith('beard_'))
    : undefined;

  const selectedProducts = [shampoo, styler, beard]
    .filter((product): product is Product => Boolean(product))
    .concat(
      compatibleProducts.filter(
        (product) =>
          product !== shampoo &&
          product !== styler &&
          product !== beard,
      ),
    )
    .slice(0, analysis.facialFeatures.beard ? 5 : 4);

  return {
    haircuts: compatibleHaircuts,
    products: selectedProducts,
    routine: buildFallbackRoutine(analysis, language),
    summary:
      language === 'en'
        ? 'These recommendations balance your face shape, hair texture, and maintenance needs for a polished Bold Men\'s result.'
        : 'Estas recomendacoes equilibram o formato do rosto, a textura do cabelo e a manutencao para um resultado polido Bold Men\'s.',
  };
}

export async function generateRecommendations(
  analysis: HairAnalysis,
  language: Language,
): Promise<Recommendations> {
  const compatibleHaircuts = filterCompatibleHaircuts(analysis).slice(0, 10);
  const compatibleProducts = filterCompatibleProducts(analysis).slice(0, 14);

  try {
    const client = await getAnthropicClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: buildRecommendationSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: JSON.stringify(
            {
              analysis,
              availableHaircuts: compatibleHaircuts,
              availableProducts: compatibleProducts,
            },
            null,
            2,
          ),
        },
      ],
    });

    const rawText = extractText(response.content);
    const parsed = recommendationResponseSchema.parse(JSON.parse(rawText));

    const selectedHaircuts = parsed.selectedHaircutIds
      .map((id) => compatibleHaircuts.find((haircut) => haircut.id === id))
      .filter((haircut): haircut is Haircut => Boolean(haircut))
      .slice(0, 3);

    const selectedProducts = parsed.selectedProductIds
      .map((id) => compatibleProducts.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));

    const hasShampoo = selectedProducts.some((product) => product.category === 'shampoo');
    const hasStyler = selectedProducts.some((product) => isStyler(product));

    if (selectedHaircuts.length !== 3 || !hasShampoo || !hasStyler) {
      throw new Error('Model returned incomplete recommendations');
    }

    return {
      haircuts: selectedHaircuts,
      products: selectedProducts,
      routine: parsed.routine,
      summary: parsed.summary,
    };
  } catch (error) {
    logger.warn('Falling back to deterministic recommendations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return buildFallbackRecommendations(analysis, language);
  }
}
