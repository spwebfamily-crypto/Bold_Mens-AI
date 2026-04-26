export type Plan = 'free' | 'plus';

export type HairType = 'straight' | 'wavy' | 'curly' | 'coily' | 'thinning' | 'unknown';

export type HairCondition = 'healthy' | 'dry' | 'oily' | 'damaged' | 'dandruff' | 'thinning' | 'unknown';

export type MaintenanceLevel = 'low' | 'medium' | 'high';

export type AnalysisConfidence = 'low' | 'medium' | 'high';

export interface FaceAnalysis {
  confidence: AnalysisConfidence;
  proportions: string;
  forehead: string;
  cheekbones: string;
  jawline: string;
  facialHair: string;
  visagismNotes: string[];
}

export interface ProductRecommendation {
  name: string;
  category: string;
  reason: string;
  priority: number;
}

export interface ReferenceImage {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  description: string;
}

export interface HaircutRecommendation {
  name: string;
  score: number;
  reason: string;
  maintenance: MaintenanceLevel;
  idealFor: string[];
}

export interface Trend {
  id: string;
  name: string;
  season: string;
  description: string;
  idealHairTypes: HairType[];
  maintenance: MaintenanceLevel;
  source: string;
  plusOnly?: boolean;
  mediaUrl?: string;
}

export interface Recommendations {
  haircut: HaircutRecommendation;
  alternatives: HaircutRecommendation[];
  products: ProductRecommendation[];
  dailyRoutine?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface StructuredAnalysis {
  faceShape: string;
  faceAnalysis: FaceAnalysis;
  hairType: HairType;
  hairCondition: HairCondition;
  recommendations: Recommendations;
  trends: Trend[];
  references: ReferenceImage[];
}

export interface ChatAssistantResponse {
  answer: string;
  references: ReferenceImage[];
}
