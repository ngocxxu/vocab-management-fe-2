import { EQuestionType } from '@/enum/vocab-trainer';

// labelKey is a translation key under `questionTypes`; components translate it with t(labelKey).
export const QUESTION_TYPE_OPTIONS = [
  { value: EQuestionType.MULTIPLE_CHOICE, labelKey: 'questionTypes.multipleChoice' },
  { value: EQuestionType.FILL_IN_THE_BLANK, labelKey: 'questionTypes.fillInTheBlank' },
  { value: EQuestionType.FILL_IN_BLANK_CHOICE, labelKey: 'questionTypes.fillInBlankChoice' },
  // { value: EQuestionType.SHORT_ANSWER, labelKey: 'questionTypes.shortAnswer' },
  // { value: EQuestionType.TRUE_OR_FALSE, labelKey: 'questionTypes.trueOrFalse' },
  // { value: EQuestionType.MATCHING, labelKey: 'questionTypes.matching' },
  { value: EQuestionType.TRANSLATION_AUDIO, labelKey: 'questionTypes.translationAudio' },
  { value: EQuestionType.FLIP_CARD, labelKey: 'questionTypes.flipCard' },
];

/** Question types an FSRS trainer can use. Labels come from QUESTION_TYPE_OPTIONS so every screen shows the same text. */
export const FSRS_QUESTION_TYPE_OPTIONS = [EQuestionType.FLIP_CARD, EQuestionType.FILL_IN_THE_BLANK].flatMap(
  value => QUESTION_TYPE_OPTIONS.filter(option => option.value === value),
);

/** Translation key for a question type's label; the fallback covers a type with no option. */
export function getQuestionTypeLabelKey(questionType: EQuestionType): string {
  const option = QUESTION_TYPE_OPTIONS.find(o => o.value === questionType);
  return option?.labelKey ?? 'questionTypes.vocabulary';
}

export const getExamUrl = (trainerId: string, questionType: EQuestionType): string => {
  if (questionType === EQuestionType.FLIP_CARD) {
    return `/vocab-trainer/${trainerId}/exam/flip-card`;
  }
  if (questionType === EQuestionType.FILL_IN_THE_BLANK) {
    return `/vocab-trainer/${trainerId}/exam/fill-in-blank`;
  }
  if (questionType === EQuestionType.FILL_IN_BLANK_CHOICE) {
    return `/vocab-trainer/${trainerId}/exam/fill-in-blank-choice`;
  }
  if (questionType === EQuestionType.TRANSLATION_AUDIO) {
    return `/vocab-trainer/${trainerId}/exam/translation-audio`;
  }
  return `/vocab-trainer/${trainerId}/exam/multiple-choice`;
};
