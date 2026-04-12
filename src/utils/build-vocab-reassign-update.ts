import type { TCreateVocab, TVocab } from '@/types/vocab-list';

function mergeReassignSubjectIds(
  currentSubjectIds: string[],
  conflictSubjectId: string,
  newSubjectIds: string[],
): string[] {
  const withoutConflict = currentSubjectIds.filter(id => id !== conflictSubjectId);
  const result = [...withoutConflict];
  for (const id of newSubjectIds) {
    if (!result.includes(id)) {
      result.push(id);
    }
  }
  return result;
}

export function buildVocabUpdateForSubjectReassign(
  vocab: TVocab,
  conflictSubjectId: string,
  newSubjectIds: string[],
): Partial<TCreateVocab> {
  const textTargets = vocab.textTargets.map(tt => ({
    wordTypeId: tt.wordType?.id ?? '',
    textTarget: tt.textTarget,
    grammar: tt.grammar,
    explanationSource: tt.explanationSource,
    explanationTarget: tt.explanationTarget,
    subjectIds: mergeReassignSubjectIds(
      tt.textTargetSubjects.map(rel => rel.subject.id),
      conflictSubjectId,
      newSubjectIds,
    ),
    vocabExamples: tt.vocabExamples,
  }));
  return {
    textTargets: textTargets as TCreateVocab['textTargets'],
  };
}
