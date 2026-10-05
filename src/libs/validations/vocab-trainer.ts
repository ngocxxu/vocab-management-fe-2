import { z } from 'zod';
import { EFsrsDirection, EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import { SRS_MAX_RETENTION, SRS_MIN_RETENTION } from './srs-settings';

// Same bounds as the backend; the backend checks them again.
export const FSRS_MAX_INTERVAL_DAYS = 36500;

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
  now?: Date;
};

export function createTrainerFormSchema({ originalEndsAt = '', now = new Date() }: TrainerFormSchemaOptions = {}) {
  const today = toDateInput(now);

  return z
    .object({
      name: z.string().min(1, 'Name is required'),
      mode: z.enum(ETrainerMode),
      questionType: z.enum(EQuestionType),
      setCountTime: z.number().min(1, 'Time must be at least 1 second'),
      reminderDisabled: z.boolean(),
      vocabAssignmentIds: z.array(z.string()).min(1, 'At least one vocabulary must be selected'),
      fsrsDirections: z.array(z.enum(EFsrsDirection)),
      fsrsDesiredRetention: z.number(),
      fsrsMaximumInterval: z.number(),
      /** null = unlimited. */
      fsrsNewPerDay: z.number().nullable(),
      /** `YYYY-MM-DD`, empty = no deadline. */
      fsrsEndsAt: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.mode !== ETrainerMode.FSRS) {
        return;
      }
      const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });

      if (!isFsrsQuestionType(value.questionType)) {
        issue('questionType', 'Pick flip card or type the answer');
      }
      if (value.fsrsDirections.length === 0) {
        issue('fsrsDirections', 'Pick at least one direction');
      }
      if (value.fsrsDesiredRetention < SRS_MIN_RETENTION || value.fsrsDesiredRetention > SRS_MAX_RETENTION) {
        issue('fsrsDesiredRetention', `Retention must be between ${Math.round(SRS_MIN_RETENTION * 100)}% and ${Math.round(SRS_MAX_RETENTION * 100)}%`);
      }
      if (!Number.isInteger(value.fsrsMaximumInterval) || value.fsrsMaximumInterval < 1 || value.fsrsMaximumInterval > FSRS_MAX_INTERVAL_DAYS) {
        issue('fsrsMaximumInterval', `Enter a whole number of days from 1 to ${FSRS_MAX_INTERVAL_DAYS}`);
      }
      if (value.fsrsNewPerDay !== null && (!Number.isInteger(value.fsrsNewPerDay) || value.fsrsNewPerDay < 1)) {
        issue('fsrsNewPerDay', 'Enter a whole number of 1 or more, or leave it empty');
      }
      if (value.fsrsEndsAt !== '') {
        if (!parseDateInput(value.fsrsEndsAt)) {
          issue('fsrsEndsAt', 'Pick a valid date');
        } else if (value.fsrsEndsAt !== originalEndsAt && value.fsrsEndsAt < today) {
          issue('fsrsEndsAt', 'The deadline cannot be in the past');
        }
      }
    });
}

export type TTrainerFormData = z.infer<ReturnType<typeof createTrainerFormSchema>>;
