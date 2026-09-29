import { describe, expect, it } from 'vitest';
import { buildQueryString } from '@/utils/api-config';

describe('buildQueryString', () => {
  it('skips undefined values', () => {
    expect(buildQueryString({ a: 1, b: undefined })).toBe('a=1');
  });

  it('repeats the key for each array item', () => {
    expect(buildQueryString({ status: ['a', 'b'] })).toBe('status=a&status=b');
  });

  it('encodes spaces and ampersands', () => {
    expect(buildQueryString({ q: 'a b&c' })).toBe('q=a+b%26c');
  });

  it('stringifies numbers and booleans, keeping falsy values', () => {
    expect(buildQueryString({ page: 0, active: false })).toBe('page=0&active=false');
  });

  it('returns an empty string for an empty object', () => {
    expect(buildQueryString({})).toBe('');
  });
});
