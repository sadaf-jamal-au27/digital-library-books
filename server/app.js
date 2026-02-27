import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = join(__dirname, 'uploads', 'covers');
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import userBooksRoutes from './routes/userBooks.js';
import adminRoutes from './routes/admin.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Behind Ingress/Nginx in production; trust proxy so rate-limit & IPs work correctly.
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    // Allow X-Forwarded-For from ingress/front proxies without throwing validation errors.
    validate: {
      xForwardedForHeader: false,
    },
  }));
}

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/user-books', userBooksRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/', (_, res) => res.json({ message: 'Digital Library API', docs: 'Use /api/... endpoints. Frontend: http://localhost:5173' }));
app.use('/api/avatars', express.static(join(__dirname, 'uploads', 'avatars')));
app.get('/api/covers/:filename', (req, res) => {
  const raw = req.params.filename || '';
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safe || safe !== raw) return res.status(400).send('Invalid filename');
  const file = join(COVERS_DIR, safe);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(file, (err) => {
    if (err && !res.headersSent) res.status(404).send('Cover not found');
  });
});

export default app;
