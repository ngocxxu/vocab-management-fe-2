import { describe, expect, it } from 'vitest';
import { parseVocabularyCountFromConflictMessage } from '@/utils/parse-vocabulary-conflict-count';

describe('parseVocabularyCountFromConflictMessage', () => {
  it('reads the count next to the word "vocabs"', () => {
    expect(parseVocabularyCountFromConflictMessage('Subject is used by 3 vocabs')).toBe(3);
  });

  it('reads the singular "vocab"', () => {
    expect(parseVocabularyCountFromConflictMessage('Used by 1 vocab')).toBe(1);
  });

  it('prefers the vocab count over an earlier number', () => {
    expect(parseVocabularyCountFromConflictMessage('Error 409: 7 vocabs affected')).toBe(7);
  });

  it('falls back to the first number in the message', () => {
    expect(parseVocabularyCountFromConflictMessage('Conflict with 5 items')).toBe(5);
  });

  it('returns undefined when there is no number', () => {
    expect(parseVocabularyCountFromConflictMessage('Conflict')).toBeUndefined();
  });

  it('joins an array message before parsing', () => {
    expect(parseVocabularyCountFromConflictMessage(['Used by', '2 vocabs'])).toBe(2);
  });

  it('returns undefined for an empty array or non-string input', () => {
    expect(parseVocabularyCountFromConflictMessage([])).toBeUndefined();
    expect(parseVocabularyCountFromConflictMessage(42)).toBeUndefined();
    expect(parseVocabularyCountFromConflictMessage(undefined)).toBeUndefined();
  });
});
