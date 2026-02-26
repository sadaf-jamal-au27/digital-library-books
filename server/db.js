import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital-library';

export async function connectDB() {
  if (mongoose.connection.readyState !== 0) return; // already connected or connecting
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
}

export default mongoose;
