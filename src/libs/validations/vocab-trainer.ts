import { z } from 'zod';
import { EFsrsDirection, EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import { isRandomWithOthers } from '@/utils/fsrs-directions';
import { SRS_MAX_RETENTION, SRS_MIN_RETENTION } from './srs-settings';

// Same bounds as the backend; the backend checks them again.
export const FSRS_MAX_INTERVAL_DAYS = 36500;
/**
 * Classic reminder ranges (the backend's PASS_RULES). `default` is the starting value of a new trainer.
 * Spacing is X, the days from one attempt to the next reminder. Max passes is T, the Passes that complete the trainer.
 */
export const CLASSIC_SPACING_DAYS = { min: 2, max: 30, default: 2 } as const;
export const CLASSIC_MAX_REPEAT = { min: 3, max: 20, default: 6 } as const;
/** The backend limit of a trainer name when starting a new cycle. */
const MAX_TRAINER_NAME_LENGTH = 200;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_INPUT = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The question types an FSRS trainer can review. */
const FSRS_QUESTION_TYPES = [EQuestionType.FLIP_CARD, EQuestionType.FILL_IN_THE_BLANK] as const;

export function isFsrsQuestionType(questionType: EQuestionType): boolean {
  return (FSRS_QUESTION_TYPES as readonly EQuestionType[]).includes(questionType);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** `YYYY-MM-DD` of a date in the local timezone, the format of `<input type="date">`. */
function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateInput(value: string): Date | null {
  const match = DATE_INPUT.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return toDateInput(date) === value ? date : null;
}

/** The cycle ends at the end of the chosen day, local time. Empty = no deadline. */
export function dateInputToEndsAt(value: string): string | null {
  const date = parseDateInput(value);
  if (!date) {
    return null;
  }
  date.setHours(23, 59, 59, 0);

  return date.toISOString();
}

export function endsAtToDateInput(endsAt: string | null | undefined): string {
  return endsAt ? toDateInput(new Date(endsAt)) : '';
}

/** Whole local days from today to the chosen day; 0 for today. */
function daysUntil(value: string, now: Date): number {
  const target = parseDateInput(value);
  const today = parseDateInput(toDateInput(now));
  if (!target || !today) {
    return 0;
  }

  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

/** One card per word and direction. */
export function countCards(wordCount: number, directionCount: number): number {
  return Math.max(0, wordCount) * Math.max(0, directionCount);
}

/** New cards per day that bring every card in before the deadline; null without a usable deadline. */
export function suggestNewPerDay(cardCount: number, endsAtInput: string, now: Date): number | null {
  if (cardCount <= 0 || !parseDateInput(endsAtInput)) {
    return null;
  }
  const daysLeft = Math.max(1, daysUntil(endsAtInput, now));

  return Math.ceil(cardCount / daysLeft);
}

type TrainerFormSchemaOptions = {
  /** The deadline the trainer already has. Keeping it as it is must stay valid even after it has passed. */
  originalEndsAt?: string;
  /** Passes the trainer already has. Classic max passes (T) cannot go below it. 0 for a new trainer. */
  earnedPasses?: number;
  now?: Date;
};

type IssueAdder = (path: string, message: string) => void;

function isWholeNumberInRange(value: number, range: { min: number; max: number }): boolean {
  return Number.isInteger(value) && value >= range.min && value <= range.max;
}

function checkClassicReminders(value: { reminderSpacingDays: number; reminderMaxRepeat: number }, earnedPasses: number, issue: IssueAdder): void {
  if (!isWholeNumberInRange(value.reminderSpacingDays, CLASSIC_SPACING_DAYS)) {
    issue('reminderSpacingDays', 'validation.spacingOutOfRange');
  }
  if (!isWholeNumberInRange(value.reminderMaxRepeat, CLASSIC_MAX_REPEAT)) {
    issue('reminderMaxRepeat', 'validation.maxRepeatOutOfRange');
  } else if (value.reminderMaxRepeat < earnedPasses) {
    issue('reminderMaxRepeat', 'validation.maxRepeatBelowEarned');
  }
}

export function createTrainerFormSchema({ originalEndsAt = '', earnedPasses = 0, now = new Date() }: TrainerFormSchemaOptions = {}) {
  const today = toDateInput(now);

  return z
    .object({
      name: z.string().min(1, 'validation.nameRequired'),
      mode: z.enum(ETrainerMode),
      questionType: z.enum(EQuestionType),
      setCountTime: z.number().min(1, 'validation.timeTooShort'),
      reminderDisabled: z.boolean(),
      vocabAssignmentIds: z.array(z.string()).min(1, 'validation.vocabularyRequired'),
      /** Classic only: days from one attempt to the next reminder (X). */
      reminderSpacingDays: z.number(),
      /** Classic only: Passes that complete the trainer (T). */
      reminderMaxRepeat: z.number(),
      fsrsDirections: z.array(z.enum(EFsrsDirection)),
      fsrsDesiredRetention: z.number(),
      fsrsMaximumInterval: z.number(),
      /** null = unlimited. */
      fsrsNewPerDay: z.number().nullable(),
      /** `YYYY-MM-DD`, empty = no deadline. */
      fsrsEndsAt: z.string(),
    })
    .superRefine((value, ctx) => {
      const issue: IssueAdder = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });

      if (value.mode === ETrainerMode.CLASSIC) {
        checkClassicReminders(value, earnedPasses, issue);
        return;
      }
      if (value.mode !== ETrainerMode.FSRS) {
        return;
      }

      if (!isFsrsQuestionType(value.questionType)) {
        issue('questionType', 'validation.questionTypeNotFsrs');
      }
      if (value.fsrsDirections.length === 0) {
        issue('fsrsDirections', 'validation.directionRequired');
      }
      if (isRandomWithOthers(value.fsrsDirections)) {
        issue('fsrsDirections', 'validation.directionRandomExclusive');
      }
      if (value.fsrsDesiredRetention < SRS_MIN_RETENTION || value.fsrsDesiredRetention > SRS_MAX_RETENTION) {
        issue('fsrsDesiredRetention', 'validation.retentionOutOfRange');
      }
      if (!Number.isInteger(value.fsrsMaximumInterval) || value.fsrsMaximumInterval < 1 || value.fsrsMaximumInterval > FSRS_MAX_INTERVAL_DAYS) {
        issue('fsrsMaximumInterval', 'validation.maximumIntervalOutOfRange');
      }
      if (value.fsrsNewPerDay !== null && (!Number.isInteger(value.fsrsNewPerDay) || value.fsrsNewPerDay < 1)) {
        issue('fsrsNewPerDay', 'validation.newPerDayInvalid');
      }
      if (value.fsrsEndsAt !== '') {
        if (!parseDateInput(value.fsrsEndsAt)) {
          issue('fsrsEndsAt', 'validation.dateInvalid');
        } else if (value.fsrsEndsAt !== originalEndsAt && value.fsrsEndsAt < today) {
          issue('fsrsEndsAt', 'validation.deadlinePast');
        }
      }
    });
}

/** The form that starts a new cycle: the name of the new trainer and an optional deadline (`YYYY-MM-DD`). */
export function createCloneFormSchema({ now = new Date() }: { now?: Date } = {}) {
  const today = toDateInput(now);

  return z.object({
    name: z.string().trim().min(1, 'validation.nameRequired').max(MAX_TRAINER_NAME_LENGTH, 'validation.trainerNameTooLong'),
    endsAt: z
      .string()
      .refine(value => value === '' || parseDateInput(value) !== null, 'validation.dateInvalid')
      .refine(value => value === '' || parseDateInput(value) === null || value >= today, 'validation.deadlinePast'),
  });
}

export type TCloneFormData = z.infer<ReturnType<typeof createCloneFormSchema>>;

export type TTrainerFormData = z.infer<ReturnType<typeof createTrainerFormSchema>>;
