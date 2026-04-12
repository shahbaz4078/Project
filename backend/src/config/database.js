import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 15_000,
    maxPoolSize: 10,
  });

  return mongoose.connection;
}
