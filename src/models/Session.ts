import mongoose, { Document, Schema } from 'mongoose';
import { ConversationMessage, Language, LastAnalysis, SessionState } from '../types';

export interface ISession extends Document {
  phoneNumber: string;
  name?: string;
  state: SessionState;
  language: Language;
  lastAnalysis?: LastAnalysis;
  conversationHistory: ConversationMessage[];
  totalAnalyses: number;
  photoAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  lastInteraction: Date;
}

const ConversationMessageSchema = new Schema<ConversationMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    hasImage: { type: Boolean, default: false },
  },
  { _id: false },
);

const SessionSchema = new Schema<ISession>(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    state: {
      type: String,
      enum: ['INITIAL', 'WAITING_NAME', 'WAITING_PHOTO', 'ANALYZING', 'SHOWING_RESULTS', 'FOLLOW_UP', 'BOOKING'],
      default: 'INITIAL',
    },
    language: { type: String, enum: ['pt', 'en'], default: 'pt' },
    lastAnalysis: { type: Schema.Types.Mixed },
    conversationHistory: { type: [ConversationMessageSchema], default: [] },
    totalAnalyses: { type: Number, default: 0 },
    photoAttempts: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

SessionSchema.index({ lastInteraction: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

SessionSchema.pre('save', function sessionPreSave(next) {
  if (this.conversationHistory.length > 20) {
    this.conversationHistory = this.conversationHistory.slice(-20);
  }
  next();
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
