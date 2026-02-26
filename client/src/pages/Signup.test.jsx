import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';
import { AuthProvider } from '../context/AuthContext';

const mockFetch = vi.fn();
function renderSignup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Signup', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders create account form', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows client-side error when password too short', async () => {
    renderSignup();
    await userEvent.type(screen.getByPlaceholderText(/your name/i), 'Jane');
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'j@b.com');
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), '12345');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already registered' }),
    });
    renderSignup();
    await userEvent.type(screen.getByPlaceholderText(/your name/i), 'Jane');
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'j@b.com');
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });
});
