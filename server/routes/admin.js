import { Router } from 'express';
import multer from 'multer';
import { writeFile, mkdir, unlink, rename, access } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const execAsync = promisify(exec);
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import Book from '../models/Book.js';
import UserBook from '../models/UserBook.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, '..', 'uploads', 'books');
const COVERS_DIR = join(__dirname, '..', 'uploads', 'covers'); // must match index.js COVERS_DIR

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed'));
};
const imageFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Cover must be JPEG, PNG, GIF, or WebP'));
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => (file.fieldname === 'cover' ? imageFilter(req, file, cb) : pdfFilter(req, file, cb)),
});

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

router.post('/books', (req, res, next) => {
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 50 MB)' });
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const pdfFile = req.files?.file?.[0] || req.file;
    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }
    const { title, author, category, book_type, description, published_year } = req.body;
    if (!title?.trim() || !author?.trim() || !category?.trim() || !book_type?.trim()) {
      return res.status(400).json({ error: 'Title, author, category, and book type are required' });
    }
    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      book_type: book_type.trim(),
      description: description?.trim() || undefined,
      published_year: published_year ? parseInt(published_year, 10) : undefined,
    });
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filename = `${book._id.toString()}.pdf`;
    const filePath = join(UPLOADS_DIR, filename);
    await writeFile(filePath, pdfFile.buffer);
    book.filePath = `books/${filename}`;

    await mkdir(COVERS_DIR, { recursive: true });
    const coverFilename = `${book._id.toString()}.png`;
    const coverPath = join(COVERS_DIR, coverFilename);
    let coverSet = false;

    const coverFile = req.files?.cover?.[0];
    if (coverFile && coverFile.buffer) {
      const ext = coverFile.mimetype === 'image/png' ? 'png' : coverFile.mimetype === 'image/webp' ? 'webp' : 'jpg';
      const name = `${book._id.toString()}.${ext}`;
      const path = join(COVERS_DIR, name);
      await writeFile(path, coverFile.buffer);
      book.cover_url = `/api/covers/${name}`;
      coverSet = true;
    }
    if (!coverSet) {
      const id = book._id.toString();
      const pdfEsc = filePath.replace(/"/g, '\\"');
      const coverEsc = coverPath.replace(/"/g, '\\"');
      const outBase = join(COVERS_DIR, id);
      const outBaseEsc = outBase.replace(/"/g, '\\"');
      const PATH_PREFIXES = ['/opt/homebrew/bin/', '/usr/local/bin/', ''];
      const tryCommands = [
        async (bin) => {
          await execAsync(`${bin}pdftoppm -png -f 1 -l 1 -scale-to 400 "${pdfEsc}" "${id}"`, { shell: '/bin/bash', cwd: COVERS_DIR });
          await rename(join(COVERS_DIR, `${id}-1.png`), coverPath);
        },
        (bin) => execAsync(`${bin}convert "${pdfEsc}[0]" -density 150 -resize 400x "${coverEsc}"`, { shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 }),
        (bin) => execAsync(`${bin}magick "${pdfEsc}[0]" -density 150 -resize 400x "${coverEsc}"`, { shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 }),
      ];
      outer: for (const run of tryCommands) {
        for (const prefix of PATH_PREFIXES) {
          try {
            await run(prefix);
            await access(coverPath);
            book.cover_url = `/api/covers/${coverFilename}`;
            coverSet = true;
            console.log('Cover generated from PDF');
            break outer;
          } catch (e) {
            continue;
          }
        }
      }
      if (!coverSet) console.warn('PDF cover failed. Run: brew install poppler   (then restart server)');
    }
    await book.save();
    return res.status(201).json(book.toJSON());
  } catch (e) {
    if (e.message === 'Only PDF files are allowed') {
      return res.status(400).json({ error: e.message });
    }
    throw e;
  }
});

// Update book details (no PDF replace)
router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }
  const book = await Book.findById(id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const { title, author, category, book_type, description, cover_url, published_year, isbn } = req.body;
  if (title !== undefined) book.title = String(title).trim() || book.title;
  if (author !== undefined) book.author = String(author).trim() || book.author;
  if (category !== undefined) book.category = String(category).trim() || book.category;
  if (book_type !== undefined) book.book_type = String(book_type).trim() || book.book_type;
  if (description !== undefined) book.description = String(description).trim() || undefined;
  if (cover_url !== undefined) book.cover_url = String(cover_url).trim() || undefined;
  if (isbn !== undefined) book.isbn = String(isbn).trim() || undefined;
  if (published_year !== undefined) {
    const y = parseInt(published_year, 10);
    book.published_year = Number.isNaN(y) ? undefined : y;
  }
  await book.save();
  return res.json(book.toJSON());
});

// Delete book (and PDF file, user-book links)
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }
  const book = await Book.findById(id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.filePath) {
    const fullPath = join(UPLOADS_DIR, book.filePath.replace(/^books\//, ''));
    try {
      await unlink(fullPath);
    } catch (_) {
      // ignore if file missing
    }
  }
  if (book.cover_url && book.cover_url.startsWith('/api/covers/')) {
    const coverFilename = book.cover_url.replace(/^\/api\/covers\//, '');
    try {
      await unlink(join(COVERS_DIR, coverFilename));
    } catch (_) {}
  }
  await UserBook.deleteMany({ book: id });
  await Book.findByIdAndDelete(id);
  return res.json({ deleted: true });
});

export default router;
