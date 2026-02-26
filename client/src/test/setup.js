import '@testing-library/jest-dom';
import { vi } from 'vitest';

// JSDOM doesn't implement matchMedia; ThemeProvider relies on it.
if (!window.matchMedia) {
  window.matchMedia = (query) => {
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
    return mql;
  };
}

// Default fetch mock for components that call /api/* during render (e.g. Library inside App tests).
// Individual tests can override with vi.stubGlobal('fetch', ...) as needed.
if (!globalThis.fetch || !globalThis.fetch.__isVitestMock) {
  const defaultFetch = vi.fn(async (input) => {
    const url = typeof input === 'string' ? input : input?.url;

    if (typeof url === 'string') {
      if (url.startsWith('/api/books/categories')) return { ok: true, json: async () => [] };
      if (url.startsWith('/api/books/types')) return { ok: true, json: async () => [] };
      if (url.startsWith('/api/user-books')) return { ok: true, json: async () => [] };
      if (url.startsWith('/api/books?') || url === '/api/books') {
        return {
          ok: true,
          json: async () => ({ books: [], total: 0, page: 1, totalPages: 1 }),
        };
      }
    }

    return { ok: false, status: 404, json: async () => ({ error: 'Not mocked' }) };
  });

  defaultFetch.__isVitestMock = true;
  vi.stubGlobal('fetch', defaultFetch);
}
