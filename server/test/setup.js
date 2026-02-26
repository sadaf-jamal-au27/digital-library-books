import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB } from '../db.js';

const server = await MongoMemoryServer.create();
process.env.MONGODB_URI = server.getUri();
await connectDB();
