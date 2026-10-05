export enum EVocabTrainerType {
  SOURCE = 'source',
  TARGET = 'target',
}

export enum EQuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK_CHOICE = 'FILL_IN_BLANK_CHOICE',
  FLIP_CARD = 'FLIP_CARD',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  MATCHING = 'MATCHING',
  TRUE_OR_FALSE = 'TRUE_OR_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  TRANSLATION_AUDIO = 'TRANSLATION_AUDIO',
}

export enum EFsrsDirection {
  SOURCE_TO_TARGET = 'SOURCE_TO_TARGET',
  TARGET_TO_SOURCE = 'TARGET_TO_SOURCE',
}

/** How a trainer schedules its words. Not the question direction of Classic (`EVocabTrainerType`). */
export enum ETrainerMode {
  CLASSIC = 'CLASSIC',
  FSRS = 'FSRS',
}

/** The button the user presses after seeing the answer. */
export enum EFsrsRating {
  AGAIN = 'AGAIN',
  HARD = 'HARD',
  GOOD = 'GOOD',
  EASY = 'EASY',
}

/** A card is NEW until its first review, then REVIEW (failed cards stay REVIEW and come back after a day). */
export enum EFsrsState {
  NEW = 'NEW',
  REVIEW = 'REVIEW',
}

export enum EVocabTrainerStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}
