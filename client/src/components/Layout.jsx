import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeWrapRef = useRef(null);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClick = (e) => {
      if (themeWrapRef.current && !themeWrapRef.current.contains(e.target)) setThemeMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [themeMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Digital Library</span>
        </Link>
        <nav className="nav">
          <Link to="/">Browse</Link>
          <div className="theme-wrap" ref={themeWrapRef}>
            <button
              type="button"
              className="btn btn-icon theme-toggle"
              onClick={() => setThemeMenuOpen((o) => !o)}
              aria-label="Toggle theme"
              title={`Theme: ${theme} (${resolvedTheme})`}
            >
              <span className="theme-icon" aria-hidden>
                {resolvedTheme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
            {themeMenuOpen && (
              <div className="theme-menu">
                <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}>Dark</button>
                <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}>Light</button>
                <button type="button" className={theme === 'system' ? 'active' : ''} onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}>System</button>
              </div>
            )}
          </div>
          {user ? (
            <>
              <Link to="/my-books">My Books</Link>
              <Link to="/profile">Profile</Link>
              {user.role === 'admin' && <Link to="/upload">Upload Book</Link>}
              <span className="user-name">{user.name}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
