import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiAssetUrl } from '../lib/apiUrl';
import './BookCard.css';

export default function BookCard({ book, showAdd = false, inLibrary: inLibraryProp = false }) {
  const [adding, setAdding] = useState(false);
  const [inLibraryLocal, setInLibraryLocal] = useState(false);
  const inLibrary = inLibraryProp || inLibraryLocal;
  const { token } = useAuth();

  const addToLibrary = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token || adding) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/user-books/${book.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInLibraryLocal(true);
      else if (res.status === 409) setInLibraryLocal(true);
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="book-card">
      <Link to={`/book/${book.id}`} className="book-card-link">
        <div className="book-cover">
          {book.cover_url ? (
            <img
              src={apiAssetUrl(book.cover_url)}
              alt=""
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('show'); }}
            />
          ) : null}
          <div className={`book-cover-placeholder ${!book.cover_url ? 'show' : ''}`}>
            <span className="book-cover-icon" aria-hidden>📖</span>
            <span className="book-cover-label">No cover</span>
          </div>
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">{book.author}</p>
          <div className="book-meta">
            <span className="book-category">{book.category}</span>
            <span className="book-type">{book.book_type}</span>
          </div>
        </div>
      </Link>
      {showAdd && (
        <button
          type="button"
          className="btn btn-add"
          onClick={addToLibrary}
          disabled={adding || inLibrary}
          title={inLibrary ? 'In your library' : 'Add to my books'}
        >
          {inLibrary ? '✓ In library' : adding ? 'Adding…' : '+ Add to library'}
        </button>
      )}
    </div>
  );
}
