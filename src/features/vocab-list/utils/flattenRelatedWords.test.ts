import type { TRelatedWordItem } from '@/types/vocab-related-word';
import { describe, expect, it } from 'vitest';
import { flattenRelatedWords } from './flattenRelatedWords';

function item(id: string): TRelatedWordItem {
  return { id, linkedVocabId: null, freeText: id, word: id, isSynonym: false, isAntonym: false, isRelated: false };
}

describe('flattenRelatedWords', () => {
  it('returns a flat array as-is', () => {
    const list = [item('a'), item('b')];
    expect(flattenRelatedWords(list)).toBe(list);
  });

  it('merges grouped words in synonyms, antonyms, related order', () => {
    const result = flattenRelatedWords({ synonyms: [item('s')], antonyms: [item('a')], related: [item('r')] });
    expect(result.map(i => i.id)).toEqual(['s', 'a', 'r']);
  });

  it('dedupes by id across groups, keeping the first', () => {
    const result = flattenRelatedWords({ synonyms: [item('x')], antonyms: [item('x')], related: [item('x'), item('y')] });
    expect(result.map(i => i.id)).toEqual(['x', 'y']);
  });
});
