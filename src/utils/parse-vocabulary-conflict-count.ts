export function parseVocabularyCountFromConflictMessage(message: unknown): number | undefined {
  if (typeof message === 'string') {
    const vocabMatch = message.match(/(\d+)\s+vocabs?\b/i);
    const vocabDigits = vocabMatch?.[1];
    if (vocabDigits !== undefined) {
      return Number.parseInt(vocabDigits, 10);
    }
    const any = message.match(/(\d+)/);
    const anyDigits = any?.[1];
    return anyDigits !== undefined ? Number.parseInt(anyDigits, 10) : undefined;
  }
  if (Array.isArray(message) && message.length > 0) {
    return parseVocabularyCountFromConflictMessage(message.join(' '));
  }
  return undefined;
}
