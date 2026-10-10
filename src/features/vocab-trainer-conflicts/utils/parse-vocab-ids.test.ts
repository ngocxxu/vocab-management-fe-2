import { describe, expect, it } from 'vitest';
import { parseVocabIds } from './parse-vocab-ids';

describe('parseVocabIds', () => {
  it('splits comma-separated ids and trims them', () => {
    expect(parseVocabIds('a, b ,c')).toEqual(['a', 'b', 'c']);
  });

  it('drops blanks and duplicates', () => {
    expect(parseVocabIds(',a,,a,b,')).toEqual(['a', 'b']);
  });

  it('joins a repeated parameter', () => {
    expect(parseVocabIds(['a,b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('returns nothing for a missing parameter', () => {
    expect(parseVocabIds(undefined)).toEqual([]);
    expect(parseVocabIds('')).toEqual([]);
  });

  it('keeps at most 100 ids', () => {
    const many = Array.from({ length: 150 }, (_, i) => `id${i}`).join(',');
    expect(parseVocabIds(many)).toHaveLength(100);
  });
});
