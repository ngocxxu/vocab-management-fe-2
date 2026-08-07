import type { TRelatedWordItem, TRelatedWordsGroupedResponse } from '@/types/vocab-related-word';
import { flattenRelatedWords } from './flattenRelatedWords';

export type TRelatedWordsByType = {
  synonyms: TRelatedWordItem[];
  antonyms: TRelatedWordItem[];
  related: TRelatedWordItem[];
};

/**
 * Splits a Vocab's relatedWords (flat array or pre-grouped response) into
 * synonyms/antonyms/related lists — used by the Table view's dedicated columns.
 * Reuses the same dedupe/flatten logic as WordRelationsDisplay.
 */
export function groupRelatedWordsByType(
  relatedWords: TRelatedWordItem[] | TRelatedWordsGroupedResponse | undefined,
): TRelatedWordsByType {
  if (!relatedWords) {
    return { synonyms: [], antonyms: [], related: [] };
  }

  const items = flattenRelatedWords(relatedWords);

  return {
    synonyms: items.filter(item => item.isSynonym),
    antonyms: items.filter(item => item.isAntonym),
    related: items.filter(item => item.isRelated),
  };
}
