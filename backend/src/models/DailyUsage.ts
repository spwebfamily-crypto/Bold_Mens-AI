import { Schema, model, Types, type HydratedDocument } from 'mongoose';

export interface IDailyUsage {
  userId: Types.ObjectId;
  date: string;
  analysisCount: number;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DailyUsageDocument = HydratedDocument<IDailyUsage>;

const DailyUsageSchema = new Schema<IDailyUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    analysisCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

DailyUsageSchema.index({ userId: 1, date: 1 }, { unique: true });
DailyUsageSchema.index({ resetAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export const DailyUsage = model<IDailyUsage>('DailyUsage', DailyUsageSchema);
