import mongoose, { Document, Schema } from 'mongoose';
import { HairAnalysis, Recommendations } from '../types';

export interface IAnalysis extends Document {
  phoneNumber: string;
  sessionId: string;
  hairAnalysis: HairAnalysis;
  recommendations: Recommendations;
  imageUrl?: string;
  processingTimeMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    phoneNumber: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    hairAnalysis: { type: Schema.Types.Mixed, required: true },
    recommendations: { type: Schema.Types.Mixed, required: true },
    imageUrl: { type: String },
    processingTimeMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Analysis = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
