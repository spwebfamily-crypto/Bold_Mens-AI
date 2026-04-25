import { haircuts } from '../data/haircuts';
import { products } from '../data/products';
import { HairAnalysis, Haircut, Language, Product, QuizProfileDraft, Recommendations } from '../types';

function isStyler(product: Product): boolean {
  return ['styling_cream', 'pomade', 'wax', 'gel'].includes(product.category);
}

function scoreHaircut(
  haircut: Haircut,
  analysis: HairAnalysis,
  preferredMaintenance?: Haircut['maintenanceLevel'],
): number {
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

  if (haircut.lengthCategory === analysis.currentLength || (analysis.currentLength === 'buzz' && haircut.lengthCategory === 'short')) {
    score += 6;
  }

  if (preferredMaintenance && haircut.maintenanceLevel === preferredMaintenance) {
    score += 12;
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

  if (
    analysis.hairType.typeCode >= '3A' &&
    ['leave_in', 'oil', 'styling_cream', 'conditioner'].includes(product.category)
  ) {
    score += 12;
  }

  if (analysis.facialFeatures.beard && product.category.startsWith('beard_')) {
    score += 18;
  }

  return score;
}

function buildRoutine(
  analysis: HairAnalysis,
  language: Language,
  preferredMaintenance?: Haircut['maintenanceLevel'],
): string[] {
  const maintenanceHint =
    preferredMaintenance === 'low'
      ? language === 'en'
        ? 'Keep the routine short and repeatable.'
        : 'Mantem a rotina curta e facil de repetir.'
      : preferredMaintenance === 'high'
        ? language === 'en'
          ? 'Spend a little extra time on definition and finish.'
          : 'Dedica um pouco mais de tempo a definicao e acabamento.'
        : language === 'en'
          ? 'Balance maintenance with a polished finish.'
          : 'Equilibra manutencao com um acabamento cuidado.';

  if (language === 'en') {
    return [
      'Wash with the suggested shampoo according to your scalp and texture.',
      'Apply conditioner or leave-in through the mid-lengths and ends.',
      'Use the recommended styling product to shape the cut and control volume.',
      analysis.facialFeatures.beard
        ? 'Hydrate the beard with oil or balm and brush it into place.'
        : 'Finish with a light serum or oil if the hair feels dry.',
      `${maintenanceHint} Book a visit at Bold Men\'s for a sharper finish.`,
    ];
  }

  return [
    'Lava com o shampoo sugerido de acordo com o teu couro cabeludo e textura.',
    'Aplica condicionador ou leave-in no comprimento e nas pontas.',
    'Usa o produto de styling recomendado para dar forma ao corte e controlar o volume.',
    analysis.facialFeatures.beard
      ? 'Hidrata a barba com oleo ou balm e penteia para alinhar.'
      : 'Finaliza com serum ou oleo leve se o cabelo estiver seco.',
    `${maintenanceHint} Marca visita na Bold Men\'s para um acabamento mais preciso.`,
  ];
}

function buildSummary(
  analysis: HairAnalysis,
  language: Language,
  preferredMaintenance?: Haircut['maintenanceLevel'],
): string {
  const maintenance =
    preferredMaintenance === 'low'
      ? language === 'en'
        ? 'with low daily effort'
        : 'com baixa manutencao diaria'
      : preferredMaintenance === 'high'
        ? language === 'en'
          ? 'with a more styled finish'
          : 'com um acabamento mais trabalhado'
        : language === 'en'
          ? 'with balanced upkeep'
          : 'com manutencao equilibrada';

  if (language === 'en') {
    return `I matched these cuts to your ${analysis.faceShape} face shape, ${analysis.hairType.texture} texture, and current ${analysis.currentLength} length ${maintenance}.`;
  }

  return `Escolhi estes cortes para combinar com o teu rosto ${analysis.faceShape}, textura ${analysis.hairType.texture}, e comprimento ${analysis.currentLength} ${maintenance}.`;
}

export function filterCompatibleHaircuts(
  analysis: HairAnalysis,
  preferredMaintenance?: Haircut['maintenanceLevel'],
): Haircut[] {
  return [...haircuts]
    .filter((haircut) => !haircut.avoidForHairTypes.includes(analysis.hairType.typeCode))
    .sort((a, b) => scoreHaircut(b, analysis, preferredMaintenance) - scoreHaircut(a, analysis, preferredMaintenance));
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

export async function generateRecommendations(
  analysis: HairAnalysis,
  language: Language,
  quizProfile?: QuizProfileDraft,
): Promise<Recommendations> {
  const preferredMaintenance = quizProfile?.preferredMaintenance;
  const compatibleHaircuts = filterCompatibleHaircuts(analysis, preferredMaintenance).slice(0, 3);
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
        (product) => product !== shampoo && product !== styler && product !== beard,
      ),
    )
    .slice(0, analysis.facialFeatures.beard ? 5 : 4);

  return {
    haircuts: compatibleHaircuts,
    products: selectedProducts,
    routine: buildRoutine(analysis, language, preferredMaintenance),
    summary: buildSummary(analysis, language, preferredMaintenance),
  };
}
