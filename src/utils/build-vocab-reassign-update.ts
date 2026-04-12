import type { TCreateVocab, TVocab } from '@/types/vocab-list';

export function buildVocabUpdateForSubjectReassign(
  vocab: TVocab,
  conflictSubjectId: string,
  newSubjectId: string,
): Partial<TCreateVocab> {
  const textTargets = vocab.textTargets.map(tt => ({
    wordTypeId: tt.wordType?.id ?? '',
    textTarget: tt.textTarget,
    grammar: tt.grammar,
    explanationSource: tt.explanationSource,
    explanationTarget: tt.explanationTarget,
    subjectIds: tt.textTargetSubjects.map(rel => rel.subject.id).map(id =>
      id === conflictSubjectId ? newSubjectId : id,
    ),
    vocabExamples: tt.vocabExamples,
  }));
  return {
    textTargets: textTargets as TCreateVocab['textTargets'],
  };
}
