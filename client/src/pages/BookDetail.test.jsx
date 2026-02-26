import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookDetail from './BookDetail';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, token: null })),
}));

const mockFetch = vi.fn();
describe('BookDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('shows loading then book title and author', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            title: 'Test Book',
            author: 'Test Author',
            category: 'Fiction',
            book_type: 'eBook',
          }),
      });
    render(
      <MemoryRouter initialEntries={['/book/1']}>
        <Routes>
          <Route path="/book/:id" element={<BookDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole('heading', { name: /test book/i })).toBeInTheDocument();
    expect(screen.getByText(/test author/i)).toBeInTheDocument();
  });

  it('shows not found when book id invalid', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    render(
      <MemoryRouter initialEntries={['/book/invalid']}>
        <Routes>
          <Route path="/book/:id" element={<BookDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(/book not found/i)).toBeInTheDocument();
  });
});
