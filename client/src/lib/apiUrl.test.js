import { describe, it, expect, vi } from 'vitest';
import { apiAssetUrl } from './apiUrl';

describe('apiAssetUrl', () => {
  it('returns empty string for empty path', () => {
    expect(apiAssetUrl('')).toBe('');
    expect(apiAssetUrl(null)).toBe('');
  });

  it('returns path as-is when it starts with http', () => {
    expect(apiAssetUrl('https://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
    expect(apiAssetUrl('http://cdn.com/x')).toBe('http://cdn.com/x');
  });

  it('returns path when API_BASE is empty (dev)', () => {
    expect(apiAssetUrl('/api/covers/x.png')).toBe('/api/covers/x.png');
  });
});
