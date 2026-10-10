import { z } from 'zod';
import { EFsrsDirection, EQuestionType } from '@/enum/vocab-trainer';

// Same bounds as the backend; the backend checks them again.
export const SRS_MIN_RETENTION = 0.7;
export const SRS_MAX_RETENTION = 0.97;

export function isValidTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions();

    return timeZone.length > 0;
  } catch {
    return false;
  }
}

/** "9" for 0.9, "8.5" for 0.85: how many words out of 10 are still recalled when their turn comes. */
export function formatRecallPerTen(retention: number): string {
  return (retention * 10).toFixed(1).replace(/\.0$/, '');
}

export const srsSettingsFormSchema = z.object({
  desiredRetention: z.number().min(SRS_MIN_RETENTION).max(SRS_MAX_RETENTION),
  directions: z
    .array(z.enum(EFsrsDirection))
    .min(1, 'validation.directionRequired')
    .refine(directions => new Set(directions).size === directions.length, 'validation.directionDuplicate'),
  questionType: z.enum([EQuestionType.FLIP_CARD, EQuestionType.FILL_IN_THE_BLANK]),
  reminderEnabled: z.boolean(),
  timezone: z.string().min(1, 'validation.timezoneRequired').refine(isValidTimezone, 'validation.timezoneUnknown'),
});
