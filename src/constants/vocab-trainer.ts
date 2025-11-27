import { EQuestionType } from '@/enum/vocab-trainer';

export const QUESTION_TYPE_OPTIONS = [
  { value: EQuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { value: EQuestionType.FLIP_CARD, label: 'Flip Card' },
  { value: EQuestionType.FILL_IN_THE_BLANK, label: 'Fill in the Blank' },
  { value: EQuestionType.SHORT_ANSWER, label: 'Short Answer' },
  { value: EQuestionType.TRUE_OR_FALSE, label: 'True/False' },
  { value: EQuestionType.MATCHING, label: 'Matching' },
];

export const getExamUrl = (trainerId: string, questionType: EQuestionType): string => {
  if (questionType === EQuestionType.FLIP_CARD) {
    return `/vocab-trainer/${trainerId}/exam/flip-card`;
  }
  return `/vocab-trainer/${trainerId}/exam/multiple-choice`;
};
