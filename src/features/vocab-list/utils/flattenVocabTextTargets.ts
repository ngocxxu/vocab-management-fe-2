import type { TFlatVocabRow, TVocab } from '@/types/vocab-list';

/**
 * Flattens a Vocab list into 1 row per textTarget (used by the Table view).
 * Rows belonging to the same vocab carry group metadata (`isGroupStart`/`groupSize`)
 * so the caller can rowSpan-merge vocab-level columns (textSource, related words).
 */
export function flattenVocabTextTargets(vocabs: TVocab[]): TFlatVocabRow[] {
  return vocabs.flatMap((vocab): TFlatVocabRow[] => {
    if (vocab.textTargets.length === 0) {
      return [{
        id: `${vocab.id}::empty`,
        vocab,
        textTarget: null,
        textTargetIndex: 0,
        isGroupStart: true,
        groupSize: 1,
      }];
    }

    const groupSize = vocab.textTargets.length;
    return vocab.textTargets.map((textTarget, textTargetIndex) => ({
      id: `${vocab.id}::${textTargetIndex}`,
      vocab,
      textTarget,
      textTargetIndex,
      isGroupStart: textTargetIndex === 0,
      groupSize,
    }));
  });
}
