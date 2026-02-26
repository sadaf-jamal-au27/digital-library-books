import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyBooks from './MyBooks';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'fake-token' })),
}));

const mockFetch = vi.fn();
describe('MyBooks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('shows loading then empty state when no books', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    render(
      <MemoryRouter>
        <MyBooks />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading your library/i)).toBeInTheDocument();
    expect(await screen.findByText(/haven't added any books yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse books/i })).toBeInTheDocument();
  });

  it('shows book list when user has books', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', title: 'My Book', author: 'Me', category: 'Fiction', book_type: 'eBook' },
      ]),
    });
    render(
      <MemoryRouter>
        <MyBooks />
      </MemoryRouter>
    );
    expect(await screen.findByText('My Book')).toBeInTheDocument();
  });
});
