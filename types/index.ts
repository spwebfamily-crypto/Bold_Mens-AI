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

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  revenueCatUserId: string;
  subscriptionExpiresAt?: string;
  totalAnalyses: number;
  timezone: string;
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

export interface AnalysisResult {
  analysisId: string;
  imageUrl: string;
  faceShape: string;
  faceAnalysis?: FaceAnalysis;
  hairType: HairType;
  hairCondition: HairCondition;
  recommendations: Recommendations;
  trends: Trend[];
  references?: ReferenceImage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUri?: string;
  references?: ReferenceImage[];
  result?: AnalysisResult;
  isStreaming?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PromptUsage {
  used: number;
  limit: number;
  resetAt?: string;
}

export interface ChatAssistantResponse {
  answer: string;
  references: ReferenceImage[];
}
