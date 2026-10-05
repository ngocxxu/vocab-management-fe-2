import type { TFsrsQueueItem, TFsrsReviewResult } from '@/types/vocab-trainer';
import { EFsrsDirection, EFsrsRating } from '@/enum/vocab-trainer';

/** The order of the buttons; the keys 1-4 follow it. */
export const FSRS_RATINGS = [EFsrsRating.AGAIN, EFsrsRating.HARD, EFsrsRating.GOOD, EFsrsRating.EASY] as const;

export const FSRS_RATING_LABELS: Record<EFsrsRating, string> = {
  [EFsrsRating.AGAIN]: 'Again',
  [EFsrsRating.HARD]: 'Hard',
  [EFsrsRating.GOOD]: 'Good',
  [EFsrsRating.EASY]: 'Easy',
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

export function ratingForKey(key: string): EFsrsRating | null {
  const index = Number(key) - 1;

  return Number.isInteger(index) ? (FSRS_RATINGS[index] ?? null) : null;
}

/** The label on a rating button: when the card comes back if this button is pressed. */
export function formatInterval(days: number): string {
  if (days < 1) {
    return '<1d';
  }
  if (days < DAYS_PER_MONTH) {
    return `${Math.round(days)}d`;
  }
  if (days < DAYS_PER_YEAR) {
    return `${Math.round(days / DAYS_PER_MONTH)}mo`;
  }

  return `${(days / DAYS_PER_YEAR).toFixed(1).replace(/\.0$/, '')}y`;
}

export function estimateMinutes(questionCount: number): number {
  return Math.max(1, Math.ceil((questionCount * SECONDS_PER_QUESTION) / 60));
}

export function isBacklog(overdue: number): boolean {
  return overdue >= BACKLOG_MIN_OVERDUE;
}

/** The direction of a card decides which side is the question. */
export function directionLabel(direction: EFsrsDirection): string {
  return direction === EFsrsDirection.SOURCE_TO_TARGET ? 'Word → Meaning' : 'Meaning → Word';
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
