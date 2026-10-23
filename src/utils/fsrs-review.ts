import type { TFsrsQueueItem, TFsrsReviewResult } from '@/types/vocab-trainer';
import { EFsrsDirection, EFsrsRating } from '@/enum/vocab-trainer';

/** The order of the buttons; the keys 1-4 follow it. */
export const FSRS_RATINGS = [EFsrsRating.AGAIN, EFsrsRating.HARD, EFsrsRating.GOOD, EFsrsRating.EASY] as const;

/** Translation keys (under trainer.fsrs.rating) for the rating buttons. */
export const FSRS_RATING_LABEL_KEYS: Record<EFsrsRating, string> = {
  [EFsrsRating.AGAIN]: 'rating.again',
  [EFsrsRating.HARD]: 'rating.hard',
  [EFsrsRating.GOOD]: 'rating.good',
  [EFsrsRating.EASY]: 'rating.easy',
};

export const SESSION_SIZES = [10, 20, 30, 50] as const;
export const DEFAULT_SESSION_SIZE = 20;
export const REVIEW_AHEAD_DAYS = 7;

const SECONDS_PER_QUESTION = 15;
/** From this many overdue questions on, the start screen explains how to work through the backlog. */
const BACKLOG_MIN_OVERDUE = 20;
const MAX_DURATION_MS = 60 * 60 * 1000;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

/** Unit labels for `formatInterval`; the caller passes the translated set. */
export type TIntervalUnits = {
  lessThanDay: string;
  day: string;
  month: string;
  year: string;
};

const EN_INTERVAL_UNITS: TIntervalUnits = { lessThanDay: '<1d', day: 'd', month: 'mo', year: 'y' };

export function ratingForKey(key: string): EFsrsRating | null {
  const index = Number(key) - 1;

  return Number.isInteger(index) ? (FSRS_RATINGS[index] ?? null) : null;
}

/** The label on a rating button: when the card comes back if this button is pressed. */
export function formatInterval(days: number, units: TIntervalUnits = EN_INTERVAL_UNITS): string {
  if (days < 1) {
    return units.lessThanDay;
  }
  if (days < DAYS_PER_MONTH) {
    return `${Math.round(days)}${units.day}`;
  }
  if (days < DAYS_PER_YEAR) {
    return `${Math.round(days / DAYS_PER_MONTH)}${units.month}`;
  }

  return `${(days / DAYS_PER_YEAR).toFixed(1).replace(/\.0$/, '')}${units.year}`;
}

export function estimateMinutes(questionCount: number): number {
  return Math.max(1, Math.ceil((questionCount * SECONDS_PER_QUESTION) / 60));
}

export function isBacklog(overdue: number): boolean {
  return overdue >= BACKLOG_MIN_OVERDUE;
}

/** Translation key (under trainer.fsrs.direction) for the side the card is asked from. */
export function directionLabelKey(direction: EFsrsDirection): string {
  if (direction === EFsrsDirection.RANDOM) {
    return 'direction.random';
  }

  return direction === EFsrsDirection.SOURCE_TO_TARGET ? 'direction.sourceToTarget' : 'direction.targetToSource';
}

/** Time from showing the card to rating it, kept inside what the backend accepts. */
export function clampDuration(startedAt: number, now: number): number {
  return Math.min(MAX_DURATION_MS, Math.max(0, Math.round(now - startedAt)));
}

export function countRatings(results: readonly TFsrsReviewResult[]): Record<EFsrsRating, number> {
  const counts = { [EFsrsRating.AGAIN]: 0, [EFsrsRating.HARD]: 0, [EFsrsRating.GOOD]: 0, [EFsrsRating.EASY]: 0 };
  results.forEach(({ rating }) => {
    counts[rating] += 1;
  });

  return counts;
}

/** The cards answered Again, in the order they came: the ones the optional retry round goes through. */
export function missedItems(results: readonly TFsrsReviewResult[]): TFsrsQueueItem[] {
  return results.filter(({ rating }) => rating === EFsrsRating.AGAIN).map(({ item }) => item);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from `now` to the deadline, rounded up; 0 or less once it has passed. */
export function daysUntilEnd(endsAt: string, now: Date): number {
  return Math.ceil((new Date(endsAt).getTime() - now.getTime()) / MS_PER_DAY);
}

/** A cycle with a deadline that has passed is over; without a deadline it never ends. */
export function isCycleEnded(endsAt: string | null | undefined, now: Date): boolean {
  return Boolean(endsAt) && new Date(endsAt as string).getTime() <= now.getTime();
}

export type TDeadlineStatus = {
  /** Keys under trainer.fsrs.deadline: cycleEnded, endsToday, or daysLeft (uses `days`). */
  key: 'cycleEnded' | 'endsToday' | 'daysLeft';
  days: number;
};

export function deadlineStatus(endsAt: string, now: Date): TDeadlineStatus {
  if (isCycleEnded(endsAt, now)) {
    return { key: 'cycleEnded', days: 0 };
  }
  const days = daysUntilEnd(endsAt, now);

  return days <= 1 ? { key: 'endsToday', days } : { key: 'daysLeft', days };
}

/** "Oct 07" for `2026-10-07` in en, read from the text and formatted in UTC so the timezone cannot move the day. */
export function formatShortDate(date: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return date;
  }

  const [, year, month, day] = match;

  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString(locale, {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`;
}
