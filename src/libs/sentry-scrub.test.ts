import { describe, expect, it } from 'vitest';
import { toOriginAndPathname, toPathname } from '@/libs/sentry-scrub';

describe('toPathname', () => {
  it('drops origin, query and hash', () => {
    expect(toPathname('https://a.com/x/y?code=1&state=2#frag')).toBe('/x/y');
  });

  it('returns undefined for undefined or empty input', () => {
    expect(toPathname(undefined)).toBeUndefined();
    expect(toPathname('')).toBeUndefined();
  });

  it('still drops the query of an unparseable url', () => {
    expect(toPathname('not a url?code=1')).toBe('not a url');
  });
});

describe('toOriginAndPathname', () => {
  it('keeps origin and path but drops the query', () => {
    expect(toOriginAndPathname('https://a.com/x?code=1&state=2')).toBe('https://a.com/x');
  });

  it('returns undefined for undefined or empty input', () => {
    expect(toOriginAndPathname(undefined)).toBeUndefined();
    expect(toOriginAndPathname('')).toBeUndefined();
  });

  it('still drops the query of a relative url with no base', () => {
    expect(toOriginAndPathname('/x?code=1')).toBe('/x');
  });
});
