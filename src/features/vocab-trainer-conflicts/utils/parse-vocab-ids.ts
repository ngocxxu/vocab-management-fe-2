const MAX_VOCAB_IDS = 100;

/** The `vocabIds` query parameter: comma-separated ids, blanks and duplicates dropped, at most 100. */
export function parseVocabIds(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw.join(',') : raw ?? '';
  const ids = value.split(',').map(id => id.trim()).filter(Boolean);

  return [...new Set(ids)].slice(0, MAX_VOCAB_IDS);
}
