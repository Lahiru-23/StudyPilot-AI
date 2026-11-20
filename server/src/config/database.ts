
import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  // Reuse an existing connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Reuse an ongoing connection attempt
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;

  // Clear the cached promise after successful connection
  connectionPromise = null;

  console.log('MongoDB connected successfully');
}
