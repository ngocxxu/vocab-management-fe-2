/** Words that were in the trainer and are no longer selected. Each one loses its review schedule in that trainer. */
export function removedVocabIds(originalIds: string[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);

  return [...new Set(originalIds)].filter(id => !selected.has(id));
}
