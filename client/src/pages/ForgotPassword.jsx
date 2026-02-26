import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }
      setMessage(data.message || 'Check your email for the OTP.');
      setStep(2);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setMessage('Password reset successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <label>
              OTP (check your email)
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => setStep(1)}
              style={{ marginTop: '0.5rem' }}
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
