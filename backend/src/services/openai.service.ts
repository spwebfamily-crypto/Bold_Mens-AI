import { z } from 'zod';
import { env } from '../config/env.js';
import type {
  ChatAssistantResponse,
  HairCondition,
  HairType,
  MaintenanceLevel,
  Plan,
  ReferenceImage,
  StructuredAnalysis,
} from '../types/domain.js';
import { buildDefaultStructuredAnalysis, defaultReferences, referenceLibrary } from './recommendation.service.js';

const RESPONSES_URL = 'https://api.openai.com/v1/responses';

const hairTypeValues = ['straight', 'wavy', 'curly', 'coily', 'thinning', 'unknown'] as const;
const hairConditionValues = ['healthy', 'dry', 'oily', 'damaged', 'dandruff', 'thinning', 'unknown'] as const;
const maintenanceValues = ['low', 'medium', 'high'] as const;
const confidenceValues = ['low', 'medium', 'high'] as const;

const referenceSchema = z.object({
  title: z.string().min(2),
  imageUrl: z.string().min(8),
  sourceUrl: z.string().min(8),
  sourceName: z.string().min(2),
  description: z.string().min(8),
});

const faceAnalysisSchema = z.object({
  confidence: z.enum(confidenceValues),
  proportions: z.string().min(18),
  forehead: z.string().min(12),
  cheekbones: z.string().min(12),
  jawline: z.string().min(12),
  facialHair: z.string().min(8),
  visagismNotes: z.array(z.string().min(12)).min(3).max(5),
});

const haircutSchema = z.object({
  name: z.string().min(2),
  score: z.number().min(0).max(100),
  reason: z.string().min(20),
  maintenance: z.enum(maintenanceValues),
  idealFor: z.array(z.string()).min(1).max(5),
});

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  reason: z.string().min(12),
  priority: z.number().int().min(1).max(5),
});

const trendSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  season: z.string().min(2),
  description: z.string().min(12),
  idealHairTypes: z.array(z.enum(hairTypeValues)).min(1).max(5),
  maintenance: z.enum(maintenanceValues),
  source: z.string().min(2),
  plusOnly: z.boolean(),
  mediaUrl: z.string().min(8),
});

const analysisSchema = z.object({
  summary: z.string().min(40),
  faceShape: z.string().min(2),
  faceAnalysis: faceAnalysisSchema,
  hairType: z.enum(hairTypeValues),
  hairCondition: z.enum(hairConditionValues),
  recommendations: z.object({
    haircut: haircutSchema,
    alternatives: z.array(haircutSchema).min(2).max(3),
    products: z.array(productSchema).min(2).max(4),
    dailyRoutine: z.array(z.string()).min(3).max(5),
  }),
  trends: z.array(trendSchema).min(1).max(5),
  references: z.array(referenceSchema).min(1).max(4),
});

const chatSchema = z.object({
  answer: z.string().min(20),
  references: z.array(referenceSchema).max(4),
});

type AnalysisPayload = z.infer<typeof analysisSchema>;

const referenceImageJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'imageUrl', 'sourceUrl', 'sourceName', 'description'],
  properties: {
    title: { type: 'string' },
    imageUrl: { type: 'string' },
    sourceUrl: { type: 'string' },
    sourceName: { type: 'string' },
    description: { type: 'string' },
  },
};

const faceAnalysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['confidence', 'proportions', 'forehead', 'cheekbones', 'jawline', 'facialHair', 'visagismNotes'],
  properties: {
    confidence: { type: 'string', enum: confidenceValues },
    proportions: { type: 'string' },
    forehead: { type: 'string' },
    cheekbones: { type: 'string' },
    jawline: { type: 'string' },
    facialHair: { type: 'string' },
    visagismNotes: { type: 'array', minItems: 3, maxItems: 5, items: { type: 'string' } },
  },
};

const haircutJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'score', 'reason', 'maintenance', 'idealFor'],
  properties: {
    name: { type: 'string' },
    score: { type: 'number' },
    reason: { type: 'string' },
    maintenance: { type: 'string', enum: maintenanceValues },
    idealFor: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
  },
};

const productJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'category', 'reason', 'priority'],
  properties: {
    name: { type: 'string' },
    category: { type: 'string' },
    reason: { type: 'string' },
    priority: { type: 'integer' },
  },
};

const trendJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'season', 'description', 'idealHairTypes', 'maintenance', 'source', 'plusOnly', 'mediaUrl'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    season: { type: 'string' },
    description: { type: 'string' },
    idealHairTypes: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: { type: 'string', enum: hairTypeValues },
    },
    maintenance: { type: 'string', enum: maintenanceValues },
    source: { type: 'string' },
    plusOnly: { type: 'boolean' },
    mediaUrl: { type: 'string' },
  },
};

const analysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'faceShape',
    'faceAnalysis',
    'hairType',
    'hairCondition',
    'recommendations',
    'trends',
    'references',
  ],
  properties: {
    summary: { type: 'string' },
    faceShape: { type: 'string' },
    faceAnalysis: faceAnalysisJsonSchema,
    hairType: { type: 'string', enum: hairTypeValues },
    hairCondition: { type: 'string', enum: hairConditionValues },
    recommendations: {
      type: 'object',
      additionalProperties: false,
      required: ['haircut', 'alternatives', 'products', 'dailyRoutine'],
      properties: {
        haircut: haircutJsonSchema,
        alternatives: { type: 'array', minItems: 2, maxItems: 3, items: haircutJsonSchema },
        products: { type: 'array', minItems: 2, maxItems: 4, items: productJsonSchema },
        dailyRoutine: { type: 'array', minItems: 3, maxItems: 5, items: { type: 'string' } },
      },
    },
    trends: { type: 'array', minItems: 1, maxItems: 5, items: trendJsonSchema },
    references: { type: 'array', minItems: 1, maxItems: 4, items: referenceImageJsonSchema },
  },
};

const chatJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'references'],
  properties: {
    answer: { type: 'string' },
    references: { type: 'array', maxItems: 4, items: referenceImageJsonSchema },
  },
};

function getConfiguredHeaders() {
  return {
    Authorization: `Bearer ${env.openaiApiKey}`,
    'Content-Type': 'application/json',
  };
}

async function callResponses(body: Record<string, unknown>) {
  if (!env.openaiApiKey) {
    throw Object.assign(new Error('OPENAI_API_KEY is not configured'), { status: 503 });
  }

  const response = await fetch(RESPONSES_URL, {
    method: 'POST',
    headers: getConfiguredHeaders(),
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as any;

  if (!response.ok) {
    const message = payload?.error?.message ?? 'OpenAI request failed';
    throw Object.assign(new Error(message), { status: response.status });
  }

  return payload;
}

function extractOutputText(payload: any) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  const texts: string[] = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') {
        texts.push(content.text);
      }
    }
  }

  return texts.join('\n').trim();
}

function parseJsonOutput(payload: any) {
  const text = extractOutputText(payload);
  if (!text) {
    throw new Error('OpenAI returned an empty response');
  }

  return JSON.parse(text) as unknown;
}

function validHttpsUrl(value: string) {
  return value.startsWith('https://') || value.startsWith('data:image/');
}

function normalizeReferences(references: ReferenceImage[] | undefined, fallback = defaultReferences()) {
  const valid = (references ?? []).filter((reference) => validHttpsUrl(reference.imageUrl));
  return valid.length ? valid.slice(0, 4) : fallback;
}

function normalizeTrendMediaUrl(mediaUrl: string) {
  return validHttpsUrl(mediaUrl) ? mediaUrl : defaultReferences(1)[0].imageUrl;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function assertNotLegacyDefault(payload: AnalysisPayload) {
  const haircut = payload.recommendations.haircut;
  const defaultLike =
    normalizeText(payload.faceShape) === 'oval' &&
    payload.hairType === 'wavy' &&
    payload.hairCondition === 'healthy' &&
    normalizeText(haircut.name).includes('fade medio') &&
    Math.round(haircut.score) === 95 &&
    normalizeText(haircut.reason).includes('equilibra o formato oval');

  if (defaultLike) {
    throw new Error('OpenAI returned the legacy default analysis instead of an image-specific result');
  }
}

function buildAnalysisPrompt(plan: Plan) {
  const references = referenceLibrary
    .map((reference) => `${reference.title}: ${reference.imageUrl} (${reference.sourceUrl})`)
    .join('\n');

  return [
    'Analisa a selfie como um visagista/barbeiro senior para uma app masculina de cortes de cabelo.',
    'Responde em portugues europeu, com tom direto, tecnico e util.',
    'Baseia a recomendacao apenas no que for visivel na imagem: proporcao comprimento/largura do rosto, largura da testa, macas do rosto, mandibula, queixo, linha de cabelo, densidade, textura, direcao de crescimento e barba visivel.',
    'Se a luz, angulo, cabelo ou rosto estiverem pouco visiveis, usa confidence="low", explica a limitacao e nao inventes detalhes.',
    'O corte principal e as alternativas devem justificar o encaixe usando pelo menos dois sinais visuais observados. Evita respostas genericas como "valoriza o rosto" sem dizer o que foi observado.',
    'O score deve variar conforme confianca e encaixe real: usa 70-88 quando a foto limitar a leitura, 89-96 quando houver bom encaixe, e evita 95 por defeito.',
    'Nao repitas sempre fade medio com textura; recomenda esse corte apenas quando as proporcoes e o cabelo realmente pedirem laterais limpas e topo texturizado.',
    'Foca em formato geral do rosto, leitura facial de visagismo, tipo/condicao do cabelo, corte recomendado, manutencao, produtos e tendencias.',
    'Nao identifiques nem infiras idade, etnia, saude, genero, identidade ou outros atributos sensiveis.',
    `Plano do user: ${plan}. Para plano free, limita tendencias e rotina; para plus, podes ser mais completo.`,
    'Usa estas fotos reais como referencias visuais quando fizer sentido:',
    references,
    'Devolve JSON valido no schema pedido.',
  ].join('\n');
}

function coerceStructuredAnalysis(payload: AnalysisPayload, plan: Plan): { summary: string; structured: StructuredAnalysis } {
  const fallback = buildDefaultStructuredAnalysis(plan);
  const references = normalizeReferences(payload.references, fallback.references);

  return {
    summary: payload.summary,
    structured: {
      faceShape: payload.faceShape,
      faceAnalysis: payload.faceAnalysis,
      hairType: payload.hairType as HairType,
      hairCondition: payload.hairCondition as HairCondition,
      recommendations: {
        haircut: {
          ...payload.recommendations.haircut,
          maintenance: payload.recommendations.haircut.maintenance as MaintenanceLevel,
        },
        alternatives: payload.recommendations.alternatives.map((haircut) => ({
          ...haircut,
          maintenance: haircut.maintenance as MaintenanceLevel,
        })),
        products: payload.recommendations.products,
        dailyRoutine: plan === 'plus' ? payload.recommendations.dailyRoutine : fallback.recommendations.dailyRoutine,
      },
      trends: payload.trends.map((trend) => ({
        ...trend,
        idealHairTypes: trend.idealHairTypes as HairType[],
        maintenance: trend.maintenance as MaintenanceLevel,
        mediaUrl: normalizeTrendMediaUrl(trend.mediaUrl),
      })),
      references,
    },
  };
}

export async function analyzeSelfieWithOpenAI(input: {
  imageBase64: string;
  mimeType: string;
  plan: Plan;
}): Promise<{ summary: string; structured: StructuredAnalysis }> {
  const payload = await callResponses({
    model: env.openaiModel,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: buildAnalysisPrompt(input.plan) },
          {
            type: 'input_image',
            image_url: `data:${input.mimeType};base64,${input.imageBase64}`,
            detail: 'high',
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'boldmens_selfie_analysis',
        strict: true,
        schema: analysisJsonSchema,
      },
    },
    max_output_tokens: 3200,
  });

  const parsed = analysisSchema.parse(parseJsonOutput(payload));
  assertNotLegacyDefault(parsed);
  return coerceStructuredAnalysis(parsed, input.plan);
}

function asksForImage(text: string) {
  return /\b(foto|fotos|imagem|imagens|refer[eê]ncia|referencias|visual|gera|cria|exemplo)\b/i.test(text);
}

async function generateReferenceImage(userMessage: string) {
  if (!asksForImage(userMessage)) {
    return null;
  }

  try {
    const payload = await callResponses({
      model: env.openaiModel,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                'Gera uma foto-referencia realista de corte masculino para uma app de barbearia premium. ' +
                `Pedido do user: ${userMessage}. ` +
                'Sem texto, sem logotipos, fundo neutro, foco no cabelo e acabamento.',
            },
          ],
        },
      ],
      tools: [{ type: 'image_generation', action: 'generate' }],
    });

    const imageBase64 = (payload.output ?? [])
      .filter((item: any) => item.type === 'image_generation_call')
      .map((item: any) => item.result)
      .find((value: unknown) => typeof value === 'string');

    if (!imageBase64) {
      return null;
    }

    return {
      title: 'Referencia visual gerada',
      imageUrl: `data:image/png;base64,${imageBase64}`,
      sourceUrl: 'https://developers.openai.com/api/docs/guides/image-generation',
      sourceName: 'OpenAI GPT Image',
      description: 'Imagem gerada para visualizar a direcao de corte pedida.',
    } satisfies ReferenceImage;
  } catch {
    return null;
  }
}

export async function answerChatWithOpenAI(input: {
  message: string;
  plan: Plan;
  userName?: string;
}): Promise<ChatAssistantResponse> {
  const references = referenceLibrary
    .map((reference) => `${reference.title}: ${reference.imageUrl} (${reference.sourceUrl})`)
    .join('\n');

  const payload = await callResponses({
    model: env.openaiModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: [
              'Es especialista BoldMens AI em cortes masculinos, barba, finalizacao e tendencias.',
              'Responde em portugues europeu, direto e pratico.',
              'Quando o user pedir fotos, referencias ou exemplos visuais, inclui referencias do catalogo abaixo.',
              'Nao inventes URLs. Usa apenas URLs do catalogo ou deixa references vazio.',
              `Plano do user: ${input.plan}. Nome: ${input.userName ?? 'cliente'}.`,
              `Catalogo de referencias:\n${references}`,
              `Pergunta: ${input.message}`,
            ].join('\n'),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'boldmens_chat_answer',
        strict: true,
        schema: chatJsonSchema,
      },
    },
    max_output_tokens: 1400,
  });

  const parsed = chatSchema.parse(parseJsonOutput(payload));
  const generated = await generateReferenceImage(input.message);
  const normalized = normalizeReferences(parsed.references, asksForImage(input.message) ? defaultReferences(2) : []);

  return {
    answer: parsed.answer,
    references: generated ? [generated, ...normalized].slice(0, 4) : normalized,
  };
}
