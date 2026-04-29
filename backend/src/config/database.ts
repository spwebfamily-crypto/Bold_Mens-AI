import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not configured; database-dependent endpoints will fail.');
    return;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== 'production',
  });
  console.log('Successfully connected to MongoDB.');
}
