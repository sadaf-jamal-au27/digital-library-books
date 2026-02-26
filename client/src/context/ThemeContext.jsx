import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'digital-library-theme';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    const apply = (value) => {
      document.documentElement.setAttribute('data-theme', value);
      setResolvedTheme(value);
    };
    if (theme === 'system') {
      const q = window.matchMedia('(prefers-color-scheme: dark)');
      apply(q.matches ? 'dark' : 'light');
      const handler = () => apply(q.matches ? 'dark' : 'light');
      q.addEventListener('change', handler);
      return () => q.removeEventListener('change', handler);
    }
    apply(theme);
  }, [theme]);

  const setTheme = (value) => {
    setThemeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
