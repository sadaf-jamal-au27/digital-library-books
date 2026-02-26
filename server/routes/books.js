import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Book from '../models/Book.js';
import {
  parsePagination,
  parseSort,
  buildBookFilter,
} from '../lib/queryParser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, '..', 'uploads');

const router = Router();

// Escape regex special chars for safe partial match fallback (when text index unavailable)
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res) => {
  const { filter, searchTerm, useTextSearch } = buildBookFilter(req.query);
  const { page, limit, skip } = parsePagination(req.query);
  const { sortKey, order } = parseSort(req.query);

  const query = { ...filter };
  let sort = { [sortKey]: order };

  if (useTextSearch && searchTerm) {
    query.$text = { $search: searchTerm };
    sort = [{ score: { $meta: 'textScore' } }, { [sortKey]: order }];
  }

  let books;
  let total;
  try {
    [books, total] = await Promise.all([
      Book.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Book.countDocuments(query),
    ]);
  } catch (err) {
    if (err.code === 27 || err.message?.includes('text index')) {
      const fallbackQuery = { ...filter };
      if (searchTerm) {
        const safe = escapeRegex(searchTerm);
        const re = new RegExp(safe, 'i');
        fallbackQuery.$or = [
          { title: re },
          { author: re },
          { description: re },
        ];
      }
      [books, total] = await Promise.all([
        Book.find(fallbackQuery).sort({ [sortKey]: order }).skip(skip).limit(limit).lean(),
        Book.countDocuments(fallbackQuery),
      ]);
    } else {
      throw err;
    }
  }

  const withId = books.map((b) => ({
    ...b,
    id: b._id.toString(),
    _id: undefined,
  }));

  res.json({
    books: withId,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

router.get('/categories', async (req, res) => {
  const categories = await Book.distinct('category').sort();
  res.json(categories);
});

router.get('/types', async (req, res) => {
  const types = await Book.distinct('book_type').sort();
  res.json(types);
});

router.get('/:id/file', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book || !book.filePath) return res.status(404).json({ error: 'File not found' });
  const fullPath = join(UPLOADS_DIR, book.filePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(fullPath, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'File not found' });
  });
});

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ ...book, id: book._id.toString(), _id: undefined });
});

export default router;
