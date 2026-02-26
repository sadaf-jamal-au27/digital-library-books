import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, logout: vi.fn() })),
}));

describe('Layout', () => {
  it('shows logo and Browse link', () => {
    renderWithProviders(<Layout />, { withAuthProvider: false, withOutletRoute: true });
    expect(screen.getByRole('link', { name: /digital library/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument();
  });

  it('shows Log in and Sign up when user is null', () => {
    renderWithProviders(<Layout />, { withAuthProvider: false, withOutletRoute: true });
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows My Books and Profile when user is set', () => {
    useAuth.mockReturnValue({
      user: { name: 'Jane', email: 'j@b.com', role: 'user' },
      logout: vi.fn(),
    });
    renderWithProviders(<Layout />, { withAuthProvider: false, withOutletRoute: true });
    expect(screen.getByRole('link', { name: /my books/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });
});
