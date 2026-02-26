import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  const mockFetch = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders email and password fields and submit button', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error when login fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email or password' }),
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
