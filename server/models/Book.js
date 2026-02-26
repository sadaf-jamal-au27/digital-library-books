import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    book_type: { type: String, required: true },
    cover_url: { type: String },
    isbn: { type: String },
    published_year: { type: Number },
    filePath: { type: String }, // relative path for uploaded PDF (e.g. "books/abc123.pdf")
  },
  { timestamps: true }
);

// Text index for fast full-text search (title, author, description)
bookSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { name: 'books_text', weights: { title: 10, author: 5, description: 1 } }
);

// Compound index for filtered list queries (category + book_type)
bookSchema.index({ category: 1, book_type: 1 });

// Sort-field indexes for efficient sort + skip/limit
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ published_year: 1 });
bookSchema.index({ createdAt: -1 });

bookSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Book', bookSchema);
