
import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing in server/.env'
    );
  }

  try {
    await mongoose.connect(uri);

    console.log('✅ MongoDB connected successfully');
    console.log(
      '📦 Database:',
      mongoose.connection.name
    );

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}
