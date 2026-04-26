import type { Plan, ReferenceImage, StructuredAnalysis, Trend } from '../types/domain.js';

export const TREND_SEASON = 'Primavera/Verao 2026';
export const BOLDMENS_SITE_URL = 'https://boldmens.co';

export const referenceLibrary: ReferenceImage[] = [
  {
    title: 'Referencia de corte em cadeira',
    imageUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
    sourceUrl: `${BOLDMENS_SITE_URL}/#galeria`,
    sourceName: 'BoldMens Galeria',
    description: 'Foto real do ambiente BoldMens para visualizar acabamento e proporcao do corte.',
  },
  {
    title: 'Detalhe de corte e textura',
    imageUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
    sourceUrl: `${BOLDMENS_SITE_URL}/#galeria`,
    sourceName: 'BoldMens Galeria',
    description: 'Referencia visual para textura no topo e limpeza nas laterais.',
  },
  {
    title: 'Produtos de finalizacao',
    imageUrl: `${BOLDMENS_SITE_URL}/galeria/detalhesprodutos.jpg`,
    sourceUrl: `${BOLDMENS_SITE_URL}/#galeria`,
    sourceName: 'BoldMens Galeria',
    description: 'Referencia para rotina de produto e acabamento matte/natural.',
  },
];

export function defaultReferences(limit = 3) {
  return referenceLibrary.slice(0, limit);
}

export const staticTrends: Trend[] = [
  {
    id: 'textured-crop-2026',
    name: 'Textured Crop',
    season: TREND_SEASON,
    description: 'Corte curto com textura natural no topo e laterais limpas.',
    idealHairTypes: ['straight', 'wavy'],
    maintenance: 'low',
    source: 'BoldMens AI trend model',
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
  },
  {
    id: 'mid-fade-texture-2026',
    name: 'Fade Medio com Textura',
    season: TREND_SEASON,
    description: 'Fade equilibrado com volume controlado para rosto oval ou quadrado.',
    idealHairTypes: ['wavy', 'curly'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
  },
  {
    id: 'modern-side-part-2026',
    name: 'Modern Side Part',
    season: TREND_SEASON,
    description: 'Risco lateral discreto com acabamento premium e natural.',
    idealHairTypes: ['straight', 'wavy'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
  },
  {
    id: 'low-taper-curls-2026',
    name: 'Low Taper Curls',
    season: TREND_SEASON,
    description: 'Taper baixo que preserva caracois no topo e define a silhueta.',
    idealHairTypes: ['curly', 'coily'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
  },
  {
    id: 'flow-cut-2026',
    name: 'Flow Cut',
    season: TREND_SEASON,
    description: 'Comprimento medio com movimento natural e pouco produto.',
    idealHairTypes: ['straight', 'wavy'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
  },
  {
    id: 'buzz-fade-2026',
    name: 'Buzz Fade Premium',
    season: TREND_SEASON,
    description: 'Buzz cut com fade suave e linhas limpas para baixa manutencao.',
    idealHairTypes: ['straight', 'wavy', 'curly', 'coily'],
    maintenance: 'low',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
  },
  {
    id: 'soft-mullet-2026',
    name: 'Soft Mullet',
    season: TREND_SEASON,
    description: 'Versao discreta do mullet com textura moderna e nuca controlada.',
    idealHairTypes: ['wavy', 'curly'],
    maintenance: 'high',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
  },
  {
    id: 'ivy-league-2026',
    name: 'Ivy League Natural',
    season: TREND_SEASON,
    description: 'Classico arrumado, curto nas laterais e flexivel no topo.',
    idealHairTypes: ['straight', 'wavy'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
  },
  {
    id: 'curly-fringe-2026',
    name: 'Curly Fringe',
    season: TREND_SEASON,
    description: 'Franja encaracolada com laterais leves para destacar textura.',
    idealHairTypes: ['curly'],
    maintenance: 'medium',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte2.jpg`,
  },
  {
    id: 'slick-back-taper-2026',
    name: 'Slick Back Taper',
    season: TREND_SEASON,
    description: 'Penteado para tras com taper limpo e acabamento sofisticado.',
    idealHairTypes: ['straight', 'wavy'],
    maintenance: 'high',
    source: 'BoldMens AI trend model',
    plusOnly: true,
    mediaUrl: `${BOLDMENS_SITE_URL}/galeria/corte.jpg`,
  },
];

export function trendsForPlan(plan: Plan) {
  return plan === 'plus' ? staticTrends : staticTrends.slice(0, 3);
}

export function buildDefaultStructuredAnalysis(plan: Plan): StructuredAnalysis {
  const trends = trendsForPlan(plan);

  return {
    faceShape: 'oval',
    faceAnalysis: {
      confidence: 'low',
      proportions: 'Leitura demonstrativa sem avaliacao real da selfie.',
      forehead: 'Nao avaliado no modo mock.',
      cheekbones: 'Nao avaliado no modo mock.',
      jawline: 'Nao avaliado no modo mock.',
      facialHair: 'Nao avaliado no modo mock.',
      visagismNotes: [
        'Configura OPENAI_API_KEY para uma analise real baseada na imagem.',
        'O mock deve ser usado apenas em desenvolvimento com ALLOW_MOCK_ANALYSIS=true.',
        'Este resultado nao deve aparecer em producao.',
      ],
    },
    hairType: 'wavy',
    hairCondition: 'healthy',
    recommendations: {
      haircut: {
        name: 'Fade Medio com Textura',
        score: 95,
        reason: 'Equilibra o formato oval do rosto, valoriza cabelo ondulado e mantem um visual atual.',
        maintenance: 'medium',
        idealFor: ['rosto oval', 'cabelo ondulado', 'visual premium diario'],
      },
      alternatives: [
        {
          name: 'Textured Crop',
          score: 90,
          reason: 'Boa escolha para reduzir manutencao sem perder textura.',
          maintenance: 'low',
          idealFor: ['rotina pratica', 'acabamento natural'],
        },
        {
          name: 'Modern Side Part',
          score: 86,
          reason: 'Opcao mais classica para contexto profissional.',
          maintenance: 'medium',
          idealFor: ['visual formal', 'barba alinhada'],
        },
      ],
      products: [
        {
          name: 'Sea Salt Spray',
          category: 'pre-styler',
          reason: 'Da volume e textura antes de finalizar.',
          priority: 1,
        },
        {
          name: 'Pasta Matte',
          category: 'styling',
          reason: 'Segura o movimento sem brilho excessivo.',
          priority: 2,
        },
        {
          name: 'Shampoo suave',
          category: 'care',
          reason: 'Mantem o couro cabeludo limpo sem ressecar.',
          priority: 3,
        },
      ],
      dailyRoutine:
        plan === 'plus'
          ? [
              'Lavar em dias alternados com shampoo suave.',
              'Aplicar pre-styler no cabelo humido.',
              'Secar direcionando o topo para tras e ligeiramente para o lado.',
              'Finalizar com pouca pasta matte e dedos, sem pentear demais.',
            ]
          : undefined,
    },
    trends,
    references: defaultReferences(),
  };
}
