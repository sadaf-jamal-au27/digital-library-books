import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookCard from './BookCard';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: null, user: null, loading: false })),
}));

const mockBook = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  category: 'Fiction',
  book_type: 'eBook',
  cover_url: null,
};

function renderBookCard(props = {}) {
  return render(
    <MemoryRouter>
      <BookCard book={{ ...mockBook, ...props.book }} {...props} />
    </MemoryRouter>
  );
}

describe('BookCard', () => {
  it('renders book title and author', () => {
    renderBookCard();
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('links to book detail page', () => {
    renderBookCard();
    const link = screen.getByRole('link', { name: /test book/i });
    expect(link).toHaveAttribute('href', '/book/1');
  });

  it('shows Add to library button when showAdd is true', () => {
    useAuth.mockReturnValueOnce({ token: 'fake', user: null, loading: false });
    renderBookCard({ showAdd: true });
    expect(screen.getByRole('button', { name: /add to library/i })).toBeInTheDocument();
  });

  it('does not show add button when showAdd is false', () => {
    renderBookCard({ showAdd: false });
    expect(screen.queryByRole('button', { name: /add to library/i })).not.toBeInTheDocument();
  });
});
