import type { TVocab, TWordRelationDraft } from '@/types/vocab-list';
import type { TRelatedWordItem } from '@/types/vocab-related-word';
import { describe, expect, it } from 'vitest';
import {
  getDraftRelationKey,
  mapRelatedWordsToDrafts,
  mapRelationDraftsToPayload,
  mapVocabsToRelationAutocompleteItems,
  normalizeFreeText,
  toggleRelationFlags,
} from './word-relations';

function related(id: string, over: Partial<TRelatedWordItem>): TRelatedWordItem {
  return { id, linkedVocabId: null, freeText: id, word: id, isSynonym: false, isAntonym: false, isRelated: false, ...over };
}

describe('normalizeFreeText', () => {
  it('trims and lowercases, and maps nullish to empty', () => {
    expect(normalizeFreeText('  HeLLo ')).toBe('hello');
    expect(normalizeFreeText(null)).toBe('');
    expect(normalizeFreeText(undefined)).toBe('');
  });
});

describe('getDraftRelationKey', () => {
  it('prefers the linked vocab id', () => {
    expect(getDraftRelationKey({ linkedVocabId: 'v1', freeText: 'x' })).toBe('linked:v1');
  });

  it('falls back to the normalized free text', () => {
    expect(getDraftRelationKey({ linkedVocabId: null, freeText: ' Foo ' })).toBe('free:foo');
  });
});

describe('toggleRelationFlags', () => {
  const none = { isSynonym: false, isAntonym: false, isRelated: false };

  it('turning synonym on turns antonym off', () => {
    expect(toggleRelationFlags({ ...none, isAntonym: true }, 'isSynonym')).toEqual({ ...none, isSynonym: true });
  });

  it('turning antonym on turns synonym off', () => {
    expect(toggleRelationFlags({ ...none, isSynonym: true }, 'isAntonym')).toEqual({ ...none, isAntonym: true });
  });

  it('turning synonym off leaves antonym alone', () => {
    expect(toggleRelationFlags({ ...none, isSynonym: true }, 'isSynonym')).toEqual(none);
  });

  it('related toggles independently', () => {
    expect(toggleRelationFlags({ ...none, isSynonym: true }, 'isRelated')).toEqual({ ...none, isSynonym: true, isRelated: true });
  });

  it('keeps extra fields and does not mutate the input', () => {
    const input = { ...none, id: 'k' };
    const out = toggleRelationFlags(input, 'isSynonym');
    expect(out.id).toBe('k');
    expect(input.isSynonym).toBe(false);
  });
});

describe('mapRelatedWordsToDrafts', () => {
  it('returns an empty list for undefined', () => {
    expect(mapRelatedWordsToDrafts(undefined)).toEqual([]);
  });

  it('merges duplicate relations by key and ORs their flags', () => {
    const drafts = mapRelatedWordsToDrafts({
      synonyms: [related('a', { linkedVocabId: 'v1', isSynonym: true })],
      antonyms: [],
      related: [related('a2', { linkedVocabId: 'v1', isRelated: true })],
    });
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({ linkedVocabId: 'v1', isSynonym: true, isAntonym: false, isRelated: true });
  });

  it('keeps distinct relations separate and assigns ids', () => {
    const drafts = mapRelatedWordsToDrafts([related('a', { isSynonym: true }), related('b', { isAntonym: true })]);
    expect(drafts).toHaveLength(2);
    expect(drafts[0]?.id).not.toBe(drafts[1]?.id);
  });
});

describe('mapVocabsToRelationAutocompleteItems', () => {
  it('maps id and source text', () => {
    const vocabs = [{ id: 'v1', textSource: 'hello' }] as unknown as TVocab[];
    expect(mapVocabsToRelationAutocompleteItems(vocabs)).toEqual([{ id: 'v1', sourceText: 'hello' }]);
  });
});

describe('mapRelationDraftsToPayload', () => {
  const base: TWordRelationDraft = { id: 'd', word: 'w', linkedVocabId: null, freeText: null, isSynonym: true, isAntonym: false, isRelated: false };

  it('sends linkedVocabId for a linked relation', () => {
    expect(mapRelationDraftsToPayload([{ ...base, linkedVocabId: 'v1' }])).toEqual([
      { linkedVocabId: 'v1', isSynonym: true, isAntonym: false, isRelated: false },
    ]);
  });

  it('sends freeText, falling back to the word, for a free relation', () => {
    expect(mapRelationDraftsToPayload([{ ...base, freeText: 'free' }])[0]).toMatchObject({ freeText: 'free' });
    expect(mapRelationDraftsToPayload([base])[0]).toMatchObject({ freeText: 'w' });
  });
});
