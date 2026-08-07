import type { TRelatedWordItem, TRelatedWordsGroupedResponse } from '@/types/vocab-related-word';

/**
 * Flattens a Vocab's relatedWords (flat array or pre-grouped response) into
 * a single deduped list. Shared by WordRelationsDisplay and the Table view.
 */
export function flattenRelatedWords(
  relatedWords: TRelatedWordItem[] | TRelatedWordsGroupedResponse,
): TRelatedWordItem[] {
  if (Array.isArray(relatedWords)) {
    return relatedWords;
  }
  const seen = new Set<string>();
  const result: TRelatedWordItem[] = [];
  for (const item of [...relatedWords.synonyms, ...relatedWords.antonyms, ...relatedWords.related]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}
