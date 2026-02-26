// Base URL for API (covers, avatars). Empty in dev so browser uses same origin + Vite proxy.
const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}` : path;
}
