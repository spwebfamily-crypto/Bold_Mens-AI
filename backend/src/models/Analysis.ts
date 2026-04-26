import { Schema, model, Types, type HydratedDocument } from 'mongoose';
import type {
  ChatMessage,
  FaceAnalysis,
  HairCondition,
  HairType,
  ReferenceImage,
  Recommendations,
  Trend,
} from '../types/domain.js';

export interface IAnalysis {
  userId: Types.ObjectId;
  imageUrl: string;
  imageDeleteAt: Date;
  faceShape: string;
  faceAnalysis?: FaceAnalysis;
  hairType: HairType;
  hairCondition: HairCondition;
  recommendations: Recommendations;
  trends: Trend[];
  references: ReferenceImage[];
  chatMessages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export type AnalysisDocument = HydratedDocument<IAnalysis>;

const ChatMessageSchema = new Schema<ChatMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageDeleteAt: {
      type: Date,
      required: true,
      index: true,
    },
    faceShape: {
      type: String,
      required: true,
    },
    faceAnalysis: {
      type: Schema.Types.Mixed,
      default: undefined,
    } as any,
    hairType: {
      type: String,
      required: true,
    },
    hairCondition: {
      type: String,
      required: true,
    },
    recommendations: {
      type: Schema.Types.Mixed,
      required: true,
    } as any,
    trends: {
      type: [Schema.Types.Mixed],
      default: [],
    } as any,
    references: {
      type: [Schema.Types.Mixed],
      default: [],
    } as any,
    chatMessages: {
      type: [ChatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = model<IAnalysis>('Analysis', AnalysisSchema);
