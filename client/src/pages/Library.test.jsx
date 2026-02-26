import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Library from './Library';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: null })),
}));

const mockFetch = vi.fn();
describe('Library', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders hero and discover title', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /discover your next read/i })).toBeInTheDocument();
  });

  it('fetches books and shows list when loaded', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: '1', title: 'Book One', author: 'Author', category: 'Fiction', book_type: 'eBook' }]) });
    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );
    expect(await screen.findByText('Book One')).toBeInTheDocument();
  });
});
