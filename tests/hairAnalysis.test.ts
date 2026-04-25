import { describe, expect, it } from 'vitest';
import { getFaceShapeLabel, getHairTypeLabel } from '../src/services/hairAnalysis.service';
import { detectLanguage } from '../src/utils/languageDetector';
import { formatAnalysisResponse } from '../src/utils/responseFormatter';
import { HairAnalysis, Recommendations } from '../src/types';

const mockAnalysis: HairAnalysis = {
  faceShape: 'oval',
  hairType: {
    texture: 'wavy',
    typeCode: '2B',
    density: 'medium',
    porosity: 'normal',
  },
  hairCondition: {
    moisture: 'normal',
    damage: 'mild',
    scalpCondition: 'normal',
  },
  currentLength: 'medium',
  facialFeatures: {
    beard: true,
    beardStyle: 'short boxed beard',
    foreheadSize: 'medium',
    jawlineDefinition: 'defined',
  },
  confidence: 0.87,
  additionalNotes: 'Balanced density with good movement.',
};

const mockRecommendations: Recommendations = {
  haircuts: [
    {
      id: 'textured-crop',
      name: 'Textured Crop',
      nameEn: 'Textured Crop',
      description: 'Curto e texturizado.',
      descriptionEn: 'Short and textured.',
      suitableFaceShapes: ['oval'],
      suitableHairTypes: ['2B'],
      avoidForHairTypes: [],
      maintenanceLevel: 'medium',
      lengthCategory: 'short',
      popularityScore: 80,
      boldMensSpecialty: false,
      emoji: '✂️',
    },
    {
      id: 'quiff',
      name: 'Quiff',
      nameEn: 'Quiff',
      description: 'Volume frontal.',
      descriptionEn: 'Front volume.',
      suitableFaceShapes: ['oval'],
      suitableHairTypes: ['2B'],
      avoidForHairTypes: [],
      maintenanceLevel: 'high',
      lengthCategory: 'medium',
      popularityScore: 75,
      boldMensSpecialty: false,
      emoji: '📈',
    },
    {
      id: 'taper-cut',
      name: 'Taper Cut',
      nameEn: 'Taper Cut',
      description: 'Gradual nas laterais.',
      descriptionEn: 'Gradual sides.',
      suitableFaceShapes: ['oval'],
      suitableHairTypes: ['2B'],
      avoidForHairTypes: [],
      maintenanceLevel: 'low',
      lengthCategory: 'short',
      popularityScore: 70,
      boldMensSpecialty: false,
      emoji: '📏',
    },
  ],
  products: [
    {
      id: 'shampoo',
      name: 'American Crew Daily Shampoo',
      brand: 'American Crew',
      category: 'shampoo',
      suitableFor: ['2B'],
      hairConditions: ['normal'],
      dailyUse: true,
      howToUse: 'Use in shower.',
      howToUsePt: 'Usa no banho.',
      price: 'EUR 15',
      whereToFind: 'Salon',
      emoji: '🧴',
    },
    {
      id: 'styler',
      name: 'American Crew Fiber',
      brand: 'American Crew',
      category: 'wax',
      suitableFor: ['2B'],
      hairConditions: ['normal'],
      dailyUse: true,
      howToUse: 'Use on dry hair.',
      howToUsePt: 'Usa no cabelo seco.',
      price: 'EUR 18',
      whereToFind: 'Salon',
      emoji: '✨',
    },
    {
      id: 'beard',
      name: 'Beardbrand Tree Ranger Beard Oil',
      brand: 'Beardbrand',
      category: 'beard_oil',
      suitableFor: ['beard'],
      hairConditions: ['normal'],
      dailyUse: true,
      howToUse: 'Apply daily.',
      howToUsePt: 'Aplica diariamente.',
      price: 'EUR 24',
      whereToFind: 'Online',
      emoji: '🧔',
    },
  ],
  routine: ['Passo 1', 'Passo 2', 'Passo 3', 'Passo 4', 'Passo 5'],
  summary: 'Resumo curto personalizado.',
};

describe('detectLanguage', () => {
  it('detects Portuguese text', () => {
    expect(detectLanguage('Ola, quero um corte de cabelo e enviar foto')).toBe('pt');
  });

  it('detects English text', () => {
    expect(detectLanguage('Hello, I want a haircut and will send a photo')).toBe('en');
  });
});

describe('hairAnalysis labels', () => {
  it('returns labels for all face shapes', () => {
    const shapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong', 'triangle', 'unknown'] as const;
    for (const shape of shapes) {
      expect(getFaceShapeLabel(shape, 'pt')).toBeTruthy();
      expect(getFaceShapeLabel(shape, 'en')).toBeTruthy();
    }
  });

  it('returns hair type label for all type codes', () => {
    const codes = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', 'unknown'] as const;
    for (const code of codes) {
      expect(
        getHairTypeLabel(
          {
            ...mockAnalysis,
            hairType: {
              ...mockAnalysis.hairType,
              typeCode: code,
            },
          },
          'pt',
        ),
      ).toContain(code);
    }
  });
});

describe('formatAnalysisResponse', () => {
  it('keeps each WhatsApp message at or below 1600 chars', () => {
    const messages = formatAnalysisResponse(mockAnalysis, mockRecommendations, 'pt');
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) {
      expect(message.length).toBeLessThanOrEqual(1600);
    }
  });
});
