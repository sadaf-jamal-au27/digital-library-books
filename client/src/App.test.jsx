import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders library at index', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: /digital library/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument();
  });

  it('shows login page at /login', () => {
    renderApp('/login');
    expect(screen.getByRole('heading', { name: /welcome back|sign in/i })).toBeInTheDocument();
  });

  it('shows signup page at /signup', () => {
    renderApp('/signup');
    expect(screen.getByRole('heading', { name: /sign up|create account/i })).toBeInTheDocument();
  });
});
