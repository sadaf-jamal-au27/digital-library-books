import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { orderedCategories, orderedTypes } from '../lib/constants';
import './Library.css';

const PAGE_SIZE = 12;

export default function Library() {
  const [data, setData] = useState({ books: [], total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [category, setCategory] = useState('');
  const [bookType, setBookType] = useState('');
  const [sort, setSort] = useState('title');
  const [order, setOrder] = useState('asc');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [myBookIds, setMyBookIds] = useState(new Set());
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setMyBookIds(new Set());
      return;
    }
    fetch('/api/user-books', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((list) => setMyBookIds(new Set(list.map((b) => b.id))));
  }, [token]);

  useEffect(() => {
    Promise.all([
      fetch('/api/books/categories').then((r) => r.json()),
      fetch('/api/books/types').then((r) => r.json()),
    ]).then(([cat, typ]) => {
      setCategories(orderedCategories(cat));
      setTypes(orderedTypes(typ));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (bookType) params.set('book_type', bookType);
    params.set('sort', sort);
    params.set('order', order);
    if (query.trim()) params.set('q', query.trim());
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    fetch(`/api/books?${params}`)
      .then((r) => r.json())
      .then((res) => {
        setData({
          books: res.books || [],
          total: res.total ?? 0,
          page: res.page ?? 1,
          totalPages: res.totalPages ?? 1,
        });
      })
      .finally(() => setLoading(false));
  }, [category, bookType, sort, order, query, page]);

  const handleFilterChange = () => setPage(1);

  return (
    <div className="library">
      <div className="library-hero">
        <h1 className="library-title">Discover your next read</h1>
        <p className="library-subtitle">Browse, filter, and add books to your collection</p>
      </div>

      <div className="library-toolbar">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            type="search"
            placeholder="Search by title, author…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="search-input"
          />
        </div>
        <div className="filters">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
            className="filter-select"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={bookType}
            onChange={(e) => { setBookType(e.target.value); handleFilterChange(); }}
            className="filter-select"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
            className="filter-select"
            aria-label="Sort by"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="published_year">Year</option>
            <option value="created_at">Recently added</option>
          </select>
          <select
            value={order}
            onChange={(e) => { setOrder(e.target.value); handleFilterChange(); }}
            className="filter-select"
            aria-label="Order"
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="library-loading">Loading books…</div>
      ) : data.books.length === 0 ? (
        <div className="library-empty">No books match your filters. Try changing them.</div>
      ) : (
        <>
          <div className="library-meta">
            <span className="library-count">
              {data.total} {data.total === 1 ? 'book' : 'books'}
              {data.totalPages > 1 && ` · Page ${data.page} of ${data.totalPages}`}
            </span>
          </div>
          <div className="book-grid">
            {data.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showAdd={!!token}
                inLibrary={myBookIds.has(book.id)}
              />
            ))}
          </div>
          {data.totalPages > 1 && (
            <nav className="pagination" aria-label="Book list pagination">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                {data.page} / {data.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
