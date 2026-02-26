import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

const mockFetch = vi.fn();
describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders step 1: reset password and email field', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('after successful OTP request shows step 2 with OTP and new password fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Check your email' }),
    });
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'u@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send otp/i }));
    expect(await screen.findByPlaceholderText(/6-digit code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });
});
