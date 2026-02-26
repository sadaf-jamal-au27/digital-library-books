/**
 * Production-grade query parsing and validation for list/search APIs.
 * - Validates and coerces types
 * - Sanitizes search terms (length, trim)
 * - Prevents ReDoS and injection via allowlisted sort/order
 */

const SORT_OPTIONS = new Set(['title', 'author', 'published_year', 'createdAt']);
const SORT_ALIAS = new Map([['created_at', 'createdAt']]);
const ORDER_OPTIONS = new Set(['asc', 'desc']);
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_PAGE = 10000;
const MAX_SEARCH_LENGTH = 200;

/**
 * Parse and validate pagination (page, limit).
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query = {}) {
  const page = Math.min(
    MAX_PAGE,
    Math.max(1, parseInt(query.page, 10) || 1)
  );
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Parse and validate sort/order. Returns allowlisted values only.
 * @param {object} query - req.query
 * @returns {{ sortKey: string, order: 'asc'|'desc' }}
 */
export function parseSort(query = {}) {
  const rawSort = (query.sort || 'title').toString().trim();
  const sortKey = SORT_ALIAS.get(rawSort) ?? (SORT_OPTIONS.has(rawSort) ? rawSort : 'title');
  const rawOrder = (query.order || 'asc').toString().toLowerCase();
  const order = ORDER_OPTIONS.has(rawOrder) ? rawOrder : 'asc';
  return { sortKey, order };
}

/**
 * Sanitize search term: trim, limit length, normalize whitespace.
 * Safe for MongoDB text search (no regex injection).
 * @param {string} q - raw search query
 * @returns {string|null} - sanitized term or null if empty/invalid
 */
export function sanitizeSearch(q) {
  if (q == null || typeof q !== 'string') return null;
  const trimmed = q.trim().replace(/\s+/g, ' ').slice(0, MAX_SEARCH_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Sanitize single-value filter (category, book_type). Trim, max length.
 * @param {string} value - raw value
 * @param {number} maxLen - max length (default 100)
 * @returns {string|null}
 */
export function sanitizeFilter(value, maxLen = 100) {
  if (value == null || typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Build MongoDB filter for books list: category, book_type, and optional text search.
 * When searchTerm is provided, returns { filter, useTextSearch: true } so route can use $text.
 * @param {object} query - req.query
 * @returns {{ filter: object, searchTerm: string|null, useTextSearch: boolean }}
 */
export function buildBookFilter(query = {}) {
  const filter = {};
  const category = sanitizeFilter(query.category);
  const book_type = sanitizeFilter(query.book_type);
  const searchTerm = sanitizeSearch(query.q);

  if (category) filter.category = category;
  if (book_type) filter.book_type = book_type;

  return {
    filter,
    searchTerm,
    useTextSearch: searchTerm != null && searchTerm.length > 0,
  };
}
