import { Router } from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import UserBook from '../models/UserBook.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const list = await UserBook.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('book')
    .lean();
  const books = list.map((ub) => {
    const b = ub.book;
    if (!b) return null;
    return {
      ...b,
      id: b._id.toString(),
      _id: undefined,
      added_at: ub.createdAt,
    };
  }).filter(Boolean);
  res.json(books);
});

router.post('/:bookId', async (req, res) => {
  const { bookId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  try {
    await UserBook.create({
      user: req.user.id,
      book: bookId,
    });
    return res.status(201).json({ added: true });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'Book already in your library' });
    }
    throw e;
  }
});

router.delete('/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const result = await UserBook.deleteOne({
    user: req.user.id,
    book: bookId,
  });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Book not in your library' });
  }
  res.json({ removed: true });
});

export default router;
