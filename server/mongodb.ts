import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

const envPaths = [
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI or DATABASE_URL environment variable is required');
  throw new Error('MongoDB connection string is missing. Set MONGODB_URI or DATABASE_URL in your environment variables.');
}

let isConnected = false;

export async function connectToMongoDB(): Promise<void> {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined');
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');

    await mongoose.connect(MONGODB_URI, {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export { mongoose };
