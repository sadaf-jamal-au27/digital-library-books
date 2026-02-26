import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_CATEGORIES, BOOK_TYPES, orderedCategories, orderedTypes } from '../lib/constants';
import './UploadBook.css';

export default function UploadBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [bookType, setBookType] = useState('');
  const [description, setDescription] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setCategories(ALL_CATEGORIES);
    setTypes(BOOK_TYPES);
    Promise.all([
      fetch('/api/books/categories').then((r) => r.json()),
      fetch('/api/books/types').then((r) => r.json()),
    ]).then(([cat, typ]) => {
      const mergedCat = orderedCategories([...new Set([...ALL_CATEGORIES, ...cat])]);
      const mergedTyp = orderedTypes([...new Set([...BOOK_TYPES, ...typ])]);
      setCategories(mergedCat);
      setTypes(mergedTyp);
      if (!category) setCategory(mergedCat[0] || '');
      if (!bookType) setBookType(mergedTyp[0] || '');
    });
  }, [user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (!title.trim() || !author.trim() || !category.trim() || !bookType.trim()) {
      setError('Title, author, category, and book type are required');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('author', author.trim());
    formData.append('category', category.trim());
    formData.append('book_type', bookType.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (publishedYear.trim()) formData.append('published_year', publishedYear.trim());
    formData.append('file', file);
    if (coverFile) formData.append('cover', coverFile);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      setSuccess(true);
      setTitle('');
      setAuthor('');
      setDescription('');
      setPublishedYear('');
      setFile(null);
      setCoverFile(null);
      setTimeout(() => {
        setSuccess(false);
        navigate(`/book/${data.id}`);
      }, 1500);
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

  return (
    <div className="upload-book">
      <h1 className="upload-title">Upload a book (PDF)</h1>
      <p className="upload-subtitle">Add a book from your computer. Upload a PDF and optionally a cover image (JPEG/PNG) so the book shows a cover.</p>
      <form onSubmit={handleSubmit} className="upload-form">
        {error && <div className="upload-error">{error}</div>}
        {success && <div className="upload-success">Book uploaded! Redirecting…</div>}
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
          Published year
          <input type="number" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} placeholder="e.g. 2020" min="1000" max="2100" />
        </label>
        <label>
          PDF file *
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          {file && <span className="file-name">{file.name}</span>}
        </label>
        <label>
          Cover image (optional)
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {coverFile && <span className="file-name">{coverFile.name}</span>}
        </label>
        <button type="submit" className="btn btn-primary btn-upload" disabled={submitting}>
          {submitting ? 'Uploading…' : 'Upload book'}
        </button>
      </form>
    </div>
  );
}
