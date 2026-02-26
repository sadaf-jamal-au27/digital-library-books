import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState !== 0) return; // already connected or connecting
  // Read env at call-time (tests set MONGODB_URI in vitest setup)
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital-library';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export default mongoose;
