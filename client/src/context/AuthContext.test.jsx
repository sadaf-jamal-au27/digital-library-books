import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <span>Loading</span>;
  return <span>{user ? `User: ${user.email}` : 'No user'}</span>;
}

describe('AuthContext', () => {
  it('throws when useAuth is used outside AuthProvider', () => {
    expect(() => render(<TestConsumer />)).toThrow(/useAuth must be used within AuthProvider/);
  });

  it('provides null user when no token in storage', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByText(/no user/i)).toBeInTheDocument();
  });
});
