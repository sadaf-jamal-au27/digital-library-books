import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiAssetUrl } from '../lib/apiUrl';
import './BookDetail.css';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBook)
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!token || !book) return;
    fetch('/api/user-books', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((list) => setInLibrary(list.some((b) => b.id === book.id)));
  }, [token, book?.id]);

  const addToLibrary = async () => {
    if (!token || adding) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/user-books/${book.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInLibrary(true);
      else if (res.status === 409) setInLibrary(true);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (user?.role !== 'admin' || deleting) return;
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate('/');
      else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="book-detail-loading">Loading…</div>;
  if (!book) return <div className="book-detail-missing">Book not found. <Link to="/">Back to library</Link></div>;

  return (
    <div className="book-detail">
      <Link to="/" className="back-link">← Back to library</Link>
      <div className="book-detail-layout">
        <div className="book-detail-cover">
          {book.cover_url ? (
            <img src={apiAssetUrl(book.cover_url)} alt="" />
          ) : (
            <div className="book-cover-placeholder large">
              <span className="book-cover-icon" aria-hidden>📖</span>
              <span className="book-cover-label">No cover</span>
            </div>
          )}
        </div>
        <div className="book-detail-info">
          <h1 className="book-detail-title">{book.title}</h1>
          <p className="book-detail-author">{book.author}</p>
          <div className="book-detail-meta">
            <span className="badge">{book.category}</span>
            <span className="badge">{book.book_type}</span>
            {book.published_year && <span className="badge">{book.published_year}</span>}
          </div>
          {book.description && (
            <p className="book-detail-description">{book.description}</p>
          )}
          {book.filePath && (
            <div className="book-detail-pdf">
              <a
                href={`/api/books/${book.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Read PDF
              </a>
              <a
                href={`/api/books/${book.id}/file`}
                download={`${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}
                className="btn btn-outline"
              >
                Download PDF
              </a>
            </div>
          )}
          {token && (
            <button
              type="button"
              className="btn btn-primary btn-add-detail"
              onClick={addToLibrary}
              disabled={adding || inLibrary}
            >
              {inLibrary ? '✓ In your library' : adding ? 'Adding…' : 'Add to my library'}
            </button>
          )}
          {user?.role === 'admin' && (
            <div className="book-detail-admin">
              <Link to={`/book/${id}/edit`} className="btn btn-outline">Edit book</Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete book'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
