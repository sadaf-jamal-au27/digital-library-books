import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiAssetUrl } from '../lib/apiUrl';
import './MyBooks.css';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/user-books', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setBooks)
      .finally(() => setLoading(false));
  }, [token]);

  const remove = async (bookId) => {
    await fetch(`/api/user-books/${bookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  if (loading) return <div className="mybooks-loading">Loading your library…</div>;

  return (
    <div className="mybooks">
      <h1 className="mybooks-title">My Library</h1>
      <p className="mybooks-subtitle">Books you've added. Click to view details or remove.</p>
      {books.length === 0 ? (
        <div className="mybooks-empty">
          <p>You haven't added any books yet.</p>
          <Link to="/" className="btn btn-primary">Browse books</Link>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <Link to={`/book/${book.id}`} className="book-card-link">
                <div className="book-cover">
                  {book.cover_url ? (
                    <img src={apiAssetUrl(book.cover_url)} alt="" />
                  ) : (
                    <div className="book-cover-placeholder show">
                      <span className="book-cover-icon" aria-hidden>📖</span>
                      <span className="book-cover-label">No cover</span>
                    </div>
                  )}
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <div className="book-meta">
                    <span className="book-category">{book.category}</span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                className="btn btn-remove"
                onClick={() => remove(book.id)}
                title="Remove from library"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
