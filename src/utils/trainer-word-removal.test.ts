import { describe, expect, it } from 'vitest';
import { removedVocabIds } from './trainer-word-removal';

describe('removedVocabIds', () => {
  it('returns the words that were in the trainer and are no longer selected', () => {
    expect(removedVocabIds(['a', 'b', 'c'], ['a', 'c'])).toEqual(['b']);
  });

  it('returns nothing when words were only added', () => {
    expect(removedVocabIds(['a'], ['a', 'b'])).toEqual([]);
  });

  it('returns every word when the selection is empty', () => {
    expect(removedVocabIds(['a', 'b'], [])).toEqual(['a', 'b']);
  });

  it('does not count a duplicate original id twice', () => {
    expect(removedVocabIds(['a', 'a', 'b'], ['b'])).toEqual(['a']);
  });
});
