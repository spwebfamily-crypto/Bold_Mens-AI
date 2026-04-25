import { FaceShape, HairAnalysis, HairCondition, HairTexture, Language } from '../types';

const faceShapeLabels: Record<FaceShape, Record<Language, string>> = {
  oval: { pt: 'Oval', en: 'Oval' },
  round: { pt: 'Redondo', en: 'Round' },
  square: { pt: 'Quadrado', en: 'Square' },
  heart: { pt: 'Coração', en: 'Heart' },
  diamond: { pt: 'Diamante', en: 'Diamond' },
  oblong: { pt: 'Alongado', en: 'Oblong' },
  triangle: { pt: 'Triangular', en: 'Triangle' },
  unknown: { pt: 'Indefinido', en: 'Unknown' },
};

const textureLabels: Record<HairTexture, Record<Language, string>> = {
  straight: { pt: 'Liso', en: 'Straight' },
  wavy: { pt: 'Ondulado', en: 'Wavy' },
  curly: { pt: 'Encaracolado', en: 'Curly' },
  coily: { pt: 'Crespo', en: 'Coily' },
  afro: { pt: 'Afro', en: 'Afro' },
};

const moistureLabels: Record<HairCondition['moisture'], Record<Language, string>> = {
  dry: { pt: 'Seco', en: 'Dry' },
  normal: { pt: 'Normal', en: 'Normal' },
  oily: { pt: 'Oleoso', en: 'Oily' },
};

const damageLabels: Record<HairCondition['damage'], Record<Language, string>> = {
  none: { pt: 'Sem danos', en: 'No damage' },
  mild: { pt: 'Danos leves', en: 'Mild damage' },
  moderate: { pt: 'Danos moderados', en: 'Moderate damage' },
  severe: { pt: 'Danos severos', en: 'Severe damage' },
};

const scalpLabels: Record<HairCondition['scalpCondition'], Record<Language, string>> = {
  normal: { pt: 'Normal', en: 'Normal' },
  dry: { pt: 'Seco', en: 'Dry' },
  oily: { pt: 'Oleoso', en: 'Oily' },
  dandruff_visible: { pt: 'Caspa visível', en: 'Visible dandruff' },
};

export function getHairTypeLabel(analysis: HairAnalysis, lang: Language): string {
  const texture = textureLabels[analysis.hairType.texture][lang];
  return `${texture} ${analysis.hairType.typeCode} · ${analysis.hairType.density} · ${analysis.hairType.porosity}`;
}

export function getFaceShapeLabel(shape: FaceShape, lang: Language): string {
  return faceShapeLabels[shape][lang];
}

export function getConditionLabel(condition: HairCondition, lang: Language): string {
  return `${moistureLabels[condition.moisture][lang]} · ${damageLabels[condition.damage][lang]}`;
}

export function getScalpLabel(scalp: HairCondition['scalpCondition'], lang: Language): string {
  return scalpLabels[scalp][lang];
}
