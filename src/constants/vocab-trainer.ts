import { EQuestionType } from '@/enum/vocab-trainer';

export const QUESTION_TYPE_OPTIONS = [
  { value: EQuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { value: EQuestionType.FLIP_CARD, label: 'Flip Card' },
  { value: EQuestionType.TRUE_OR_FALSE, label: 'True/False' },
  { value: EQuestionType.FILL_IN_THE_BLANK, label: 'Fill in the Blank' },
  { value: EQuestionType.MATCHING, label: 'Matching' },
  { value: EQuestionType.SHORT_ANSWER, label: 'Short Answer' },
];
