import { describe, expect, it } from 'vitest';
import { filterCompatibleHaircuts, filterCompatibleProducts } from '../src/services/recommendation.service';
import { HairAnalysis } from '../src/types';

const curlyAnalysis: HairAnalysis = {
  faceShape: 'round',
  hairType: {
    texture: 'curly',
    typeCode: '3B',
    density: 'thick',
    porosity: 'high',
  },
  hairCondition: {
    moisture: 'dry',
    damage: 'moderate',
    scalpCondition: 'normal',
  },
  currentLength: 'medium',
  facialFeatures: {
    beard: true,
    beardStyle: 'full beard',
    foreheadSize: 'medium',
    jawlineDefinition: 'strong',
  },
  confidence: 0.91,
  additionalNotes: 'Needs hydration and shape control.',
};

describe('recommendation filtering', () => {
  it('filters haircuts so avoided types are never first-class recommendations', () => {
    const filtered = filterCompatibleHaircuts(curlyAnalysis);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((haircut) => !haircut.avoidForHairTypes.includes('3B'))).toBe(true);
  });

  it('prioritizes products matching hair condition', () => {
    const filtered = filterCompatibleProducts(curlyAnalysis);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].hairConditions.some((condition) => ['dry', 'moderate', 'normal'].includes(condition))).toBe(true);
  });

  it('keeps at least one shampoo in the top recommendations set', () => {
    const filtered = filterCompatibleProducts(curlyAnalysis).slice(0, 6);
    expect(filtered.some((product) => product.category === 'shampoo')).toBe(true);
  });
});
