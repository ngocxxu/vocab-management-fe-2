import type { TVocab } from '@/types/vocab-list';
import { describe, expect, it } from 'vitest';
import { buildVocabUpdateForSubjectReassign } from '@/utils/build-vocab-reassign-update';

function makeVocab(subjectIds: string[], wordTypeId?: string): TVocab {
  return {
    id: 'v1',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'vi',
    textSource: 'hello',
    textTargets: [
      {
        textTarget: 'xin chao',
        grammar: 'g',
        explanationSource: 'es',
        explanationTarget: 'et',
        wordType: wordTypeId ? { id: wordTypeId } : undefined,
        textTargetSubjects: subjectIds.map(id => ({ subject: { id } })),
        vocabExamples: [],
      },
    ],
  } as unknown as TVocab;
}

function subjectIdsOf(result: ReturnType<typeof buildVocabUpdateForSubjectReassign>): string[] {
  return (result.textTargets?.[0]?.subjects ?? []).map(s => ('id' in s ? s.id : ''));
}

describe('buildVocabUpdateForSubjectReassign', () => {
  it('replaces the conflicting subject with the new ones', () => {
    const result = buildVocabUpdateForSubjectReassign(makeVocab(['a', 'conflict', 'b']), 'conflict', ['n1', 'n2']);
    expect(subjectIdsOf(result)).toEqual(['a', 'b', 'n1', 'n2']);
  });

  it('does not duplicate a new subject the vocab already has', () => {
    const result = buildVocabUpdateForSubjectReassign(makeVocab(['a', 'conflict']), 'conflict', ['a', 'n1']);
    expect(subjectIdsOf(result)).toEqual(['a', 'n1']);
  });

  it('just removes the conflict when there are no new subjects', () => {
    const result = buildVocabUpdateForSubjectReassign(makeVocab(['conflict', 'a']), 'conflict', []);
    expect(subjectIdsOf(result)).toEqual(['a']);
  });

  it('copies text target fields and falls back to an empty wordTypeId', () => {
    const withType = buildVocabUpdateForSubjectReassign(makeVocab([], 'wt1'), 'x', []);
    const withoutType = buildVocabUpdateForSubjectReassign(makeVocab([]), 'x', []);
    expect(withType.textTargets?.[0]).toMatchObject({ wordTypeId: 'wt1', textTarget: 'xin chao', grammar: 'g' });
    expect(withoutType.textTargets?.[0]?.wordTypeId).toBe('');
  });
});
