import mongoose from 'mongoose';
import { backendConfig } from './env';

export async function connectDB() {
  const mongoUri = backendConfig.mongodbUri;
  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI is unconfigured in backend/.env. Operating with memory fallback state.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Backend connected to MongoDB database successfully.');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}
