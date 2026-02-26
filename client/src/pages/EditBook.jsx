import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_CATEGORIES, BOOK_TYPES, orderedCategories, orderedTypes } from '../lib/constants';
import './UploadBook.css';

export default function EditBook() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [bookType, setBookType] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      fetch(`/api/books/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/books/categories').then((r) => r.json()),
      fetch('/api/books/types').then((r) => r.json()),
    ])
      .then(([book, cat, typ]) => {
        setTitle(book.title || '');
        setAuthor(book.author || '');
        setCategory(book.category || '');
        setBookType(book.book_type || '');
        setDescription(book.description || '');
        setCoverUrl(book.cover_url || '');
        setPublishedYear(book.published_year ? String(book.published_year) : '');
        const mergedCat = orderedCategories([...new Set([...ALL_CATEGORIES, ...cat, ...(book.category ? [book.category] : [])])]);
        const mergedTyp = orderedTypes([...new Set([...BOOK_TYPES, ...typ, ...(book.book_type ? [book.book_type] : [])])]);
        setCategories(mergedCat);
        setTypes(mergedTyp);
        if (!book.category && mergedCat.length) setCategory(mergedCat[0]);
        if (!book.book_type && mergedTyp.length) setBookType(mergedTyp[0]);
      })
      .catch(() => setError('Book not found'))
      .finally(() => setLoading(false));
  }, [id, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !author.trim() || !category.trim() || !bookType.trim()) {
      setError('Title, author, category, and book type are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category: category.trim(),
          book_type: bookType.trim(),
          description: description.trim() || undefined,
          cover_url: coverUrl.trim() || undefined,
          published_year: publishedYear.trim() ? parseInt(publishedYear, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      navigate(`/book/${data.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  if (loading) return <div className="upload-book"><p className="upload-subtitle">Loading…</p></div>;
  if (error && !title) return <div className="upload-book"><p className="upload-error">{error}</p><Link to="/">Back to library</Link></div>;

  return (
    <div className="upload-book">
      <h1 className="upload-title">Edit book</h1>
      <p className="upload-subtitle">Update book details. PDF cannot be changed here (delete and re-upload to replace).</p>
      <form onSubmit={handleSubmit} className="upload-form">
        {error && <div className="upload-error">{error}</div>}
        <label>
          Title *
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Book title" />
        </label>
        <label>
          Author *
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="Author name" />
        </label>
        <label>
          Category *
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Book type *
          <select value={bookType} onChange={(e) => setBookType(e.target.value)} required>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" rows={3} />
        </label>
        <label>
          Cover image URL
          <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
        </label>
        <label>
          Published year
          <input type="number" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} placeholder="e.g. 2020" min="1000" max="2100" />
        </label>
        <button type="submit" className="btn btn-primary btn-upload" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
        <Link to={`/book/${id}`} className="btn btn-ghost" style={{ marginLeft: '0.5rem' }}>Cancel</Link>
      </form>
    </div>
  );
}
