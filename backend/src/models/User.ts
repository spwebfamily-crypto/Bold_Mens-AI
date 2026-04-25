import { Schema, model, type HydratedDocument } from 'mongoose';
import type { Plan } from '../types/domain.js';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  plan: Plan;
  revenueCatUserId: string;
  subscriptionExpiresAt?: Date;
  totalAnalyses: number;
  timezone: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['free', 'plus'],
      default: 'free',
      index: true,
    },
    revenueCatUserId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionExpiresAt: Date,
    totalAnalyses: {
      type: Number,
      default: 0,
      min: 0,
    },
    timezone: {
      type: String,
      default: 'Europe/Lisbon',
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('validate', function fillRevenueCatUserId(next) {
  if (!this.revenueCatUserId) {
    this.revenueCatUserId = this._id.toString();
  }

  next();
});

export const User = model<IUser>('User', UserSchema);
