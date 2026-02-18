import { EQuestionType } from '@/enum/vocab-trainer';

export const QUESTION_TYPE_OPTIONS = [
  { value: EQuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { value: EQuestionType.FILL_IN_THE_BLANK, label: 'Fill in the Blank' },
  // { value: EQuestionType.SHORT_ANSWER, label: 'Short Answer' },
  // { value: EQuestionType.TRUE_OR_FALSE, label: 'True/False' },
  // { value: EQuestionType.MATCHING, label: 'Matching' },
  { value: EQuestionType.TRANSLATION_AUDIO, label: 'Translation Audio' },
  { value: EQuestionType.FLIP_CARD, label: 'Flip Card' },
];

export function getQuestionTypeLabel(questionType: EQuestionType): string {
  const option = QUESTION_TYPE_OPTIONS.find(o => o.value === questionType);
  return option?.label ?? 'Vocabulary';
}

export const getExamUrl = (trainerId: string, questionType: EQuestionType): string => {
  if (questionType === EQuestionType.FLIP_CARD) {
    return `/vocab-trainer/${trainerId}/exam/flip-card`;
  }
  if (questionType === EQuestionType.FILL_IN_THE_BLANK) {
    return `/vocab-trainer/${trainerId}/exam/fill-in-blank`;
  }
  if (questionType === EQuestionType.TRANSLATION_AUDIO) {
    return `/vocab-trainer/${trainerId}/exam/translation-audio`;
  }
  return `/vocab-trainer/${trainerId}/exam/multiple-choice`;
};
