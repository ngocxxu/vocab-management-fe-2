import type { TRelatedWordItem } from '@/types/vocab-related-word';
import { describe, expect, it } from 'vitest';
import { groupRelatedWordsByType } from './groupRelatedWordsByType';

function item(id: string, flags: Partial<TRelatedWordItem>): TRelatedWordItem {
  return { id, linkedVocabId: null, freeText: id, word: id, isSynonym: false, isAntonym: false, isRelated: false, ...flags };
}

describe('groupRelatedWordsByType', () => {
  it('returns empty groups for undefined', () => {
    expect(groupRelatedWordsByType(undefined)).toEqual({ synonyms: [], antonyms: [], related: [] });
  });

  it('splits a flat array by flags', () => {
    const result = groupRelatedWordsByType([
      item('s', { isSynonym: true }),
      item('a', { isAntonym: true }),
      item('r', { isRelated: true }),
    ]);
    expect(result.synonyms.map(i => i.id)).toEqual(['s']);
    expect(result.antonyms.map(i => i.id)).toEqual(['a']);
    expect(result.related.map(i => i.id)).toEqual(['r']);
  });

  it('lets an item with several flags appear in several groups', () => {
    const result = groupRelatedWordsByType([item('x', { isSynonym: true, isRelated: true })]);
    expect(result.synonyms).toHaveLength(1);
    expect(result.related).toHaveLength(1);
    expect(result.antonyms).toHaveLength(0);
  });

  it('dedupes a grouped response before splitting', () => {
    const shared = item('x', { isSynonym: true, isRelated: true });
    const result = groupRelatedWordsByType({ synonyms: [shared], antonyms: [], related: [shared] });
    expect(result.synonyms).toHaveLength(1);
    expect(result.related).toHaveLength(1);
  });
});
