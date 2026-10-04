import type { EFsrsDirection, EQuestionType } from '@/enum/vocab-trainer';

/** The question types an FSRS trainer can review: self-rated flip card and typed answer. */
export type TSrsQuestionType = EQuestionType.FLIP_CARD | EQuestionType.FILL_IN_THE_BLANK;

/** What a new FSRS trainer starts from. The trainer keeps its own copy: changing these never changes a trainer that exists. */
export type TSrsDefaults = {
  desiredRetention: number;
  directions: EFsrsDirection[];
  questionType: TSrsQuestionType;
  reminderEnabled: boolean;
};

/** `timezone` is null until the user (or the browser, the first time) sets one. */
export type TSrsSettings = {
  defaults: TSrsDefaults;
  timezone: string | null;
};

/** Only the fields that are sent change. */
export type TUpdateSrsSettings = {
  defaults?: Partial<TSrsDefaults>;
  timezone?: string;
};
