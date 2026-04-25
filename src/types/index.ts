export type FaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'diamond'
  | 'oblong'
  | 'triangle'
  | 'unknown';

export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily' | 'afro';

export type HairTypeCode =
  | '1A'
  | '1B'
  | '1C'
  | '2A'
  | '2B'
  | '2C'
  | '3A'
  | '3B'
  | '3C'
  | '4A'
  | '4B'
  | '4C'
  | 'unknown';

export interface HairType {
  texture: HairTexture;
  typeCode: HairTypeCode;
  density: 'fine' | 'medium' | 'thick';
  porosity: 'low' | 'normal' | 'high';
}

export interface HairCondition {
  moisture: 'dry' | 'normal' | 'oily';
  damage: 'none' | 'mild' | 'moderate' | 'severe';
  scalpCondition: 'normal' | 'dry' | 'oily' | 'dandruff_visible';
}

export interface FacialFeatures {
  beard: boolean;
  beardStyle?: string | null;
  foreheadSize: 'small' | 'medium' | 'large';
  jawlineDefinition: 'soft' | 'defined' | 'strong';
}

export interface HairAnalysis {
  faceShape: FaceShape;
  hairType: HairType;
  hairCondition: HairCondition;
  currentLength: 'bald' | 'buzz' | 'short' | 'medium' | 'long';
  facialFeatures: FacialFeatures;
  confidence: number;
  additionalNotes: string;
}

export interface VisionError {
  error: 'IMAGE_QUALITY_TOO_LOW' | 'NO_FACE_DETECTED' | 'ANALYSIS_FAILED';
  reason: string;
}

export type VisionResult = HairAnalysis | VisionError;

export interface Haircut {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  imageUrl?: string;
  suitableFaceShapes: FaceShape[];
  suitableHairTypes: string[];
  avoidForHairTypes: string[];
  maintenanceLevel: 'low' | 'medium' | 'high';
  lengthCategory: 'short' | 'medium' | 'long';
  popularityScore: number;
  boldMensSpecialty: boolean;
  emoji: string;
}

export type ProductCategory =
  | 'shampoo'
  | 'conditioner'
  | 'leave_in'
  | 'styling_cream'
  | 'pomade'
  | 'wax'
  | 'gel'
  | 'oil'
  | 'serum'
  | 'treatment'
  | 'beard_oil'
  | 'beard_balm'
  | 'beard_shampoo';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  suitableFor: string[];
  hairConditions: string[];
  dailyUse: boolean;
  howToUse: string;
  howToUsePt: string;
  price: string;
  whereToFind: string;
  emoji: string;
}

export type SessionState =
  | 'INITIAL'
  | 'WAITING_NAME'
  | 'WAITING_PHOTO'
  | 'ANALYZING'
  | 'SHOWING_RESULTS'
  | 'FOLLOW_UP'
  | 'BOOKING';

export type Language = 'pt' | 'en';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasImage: boolean;
}

export interface Recommendations {
  haircuts: Haircut[];
  products: Product[];
  routine: string[];
  summary: string;
}

export interface LastAnalysis {
  hairAnalysis: HairAnalysis;
  recommendations: Recommendations;
  analyzedAt: Date;
  imageUrl?: string;
}

export interface TwilioWebhookBody {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  ProfileName?: string;
  WaId?: string;
}

export type DownloadErrorCode = 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'DOWNLOAD_FAILED';

export interface DownloadedImage {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  cloudinaryUrl?: string;
}
