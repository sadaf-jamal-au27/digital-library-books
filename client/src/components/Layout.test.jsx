import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, logout: vi.fn() })),
}));

describe('Layout', () => {
  it('shows logo and Browse link', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /digital library/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument();
  });

  it('shows Log in and Sign up when user is null', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows My Books and Profile when user is set', () => {
    useAuth.mockReturnValue({
      user: { name: 'Jane', email: 'j@b.com', role: 'user' },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /my books/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });
});
