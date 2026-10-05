import type { TFsrsQueueItem, TFsrsReviewResult } from '@/types/vocab-trainer';
import { describe, expect, it } from 'vitest';
import { EFsrsDirection, EFsrsRating, EFsrsState } from '@/enum/vocab-trainer';
import {
  clampDuration,
  countRatings,
  daysUntilEnd,
  directionLabel,
  estimateMinutes,
  formatDeadline,
  formatInterval,
  formatPercent,
  formatShortDate,
  isBacklog,
  isCycleEnded,
  missedItems,
  ratingForKey,
} from './fsrs-review';

function item(cardId: string): TFsrsQueueItem {
  const button = { due: '2026-10-05T00:00:00.000Z', scheduledDays: 1 };

  return {
    cardId,
    vocabId: `vocab-${cardId}`,
    direction: EFsrsDirection.SOURCE_TO_TARGET,
    state: EFsrsState.REVIEW,
    isNew: false,
    frontText: ['apple'],
    acceptedAnswers: ['quả táo'],
    frontLanguageCode: 'en',
    backLanguageCode: 'vi',
    preview: { AGAIN: button, HARD: button, GOOD: button, EASY: button },
  };
}

const results: TFsrsReviewResult[] = [
  { item: item('a'), rating: EFsrsRating.AGAIN },
  { item: item('b'), rating: EFsrsRating.GOOD },
  { item: item('c'), rating: EFsrsRating.AGAIN },
  { item: item('d'), rating: EFsrsRating.EASY },
];

describe('ratingForKey', () => {
  it('maps the keys 1-4 to the buttons in order', () => {
    expect(['1', '2', '3', '4'].map(ratingForKey)).toEqual([EFsrsRating.AGAIN, EFsrsRating.HARD, EFsrsRating.GOOD, EFsrsRating.EASY]);
  });

  it('ignores every other key', () => {
    expect(['0', '5', 'a', ' ', 'Enter', ''].map(ratingForKey)).toEqual([null, null, null, null, null, null]);
  });
});

describe('formatInterval', () => {
  it('shows days, months and years', () => {
    expect([1, 6, 29, 30, 45, 200, 364, 365, 548, 3650].map(formatInterval)).toEqual(['1d', '6d', '29d', '1mo', '2mo', '7mo', '12mo', '1y', '1.5y', '10y']);
  });

  it('never shows 0 days', () => {
    expect(formatInterval(0)).toBe('<1d');
  });
});

describe('session helpers', () => {
  it('estimates at least one minute', () => {
    expect([1, 4, 20, 50].map(estimateMinutes)).toEqual([1, 1, 5, 13]);
  });

  it('calls a backlog from 20 overdue questions', () => {
    expect([0, 19, 20, 400].map(isBacklog)).toEqual([false, false, true, true]);
  });

  it('labels the direction the card is asked in', () => {
    expect(directionLabel(EFsrsDirection.SOURCE_TO_TARGET)).toBe('Word → Meaning');
    expect(directionLabel(EFsrsDirection.TARGET_TO_SOURCE)).toBe('Meaning → Word');
  });

  it('keeps the duration inside what the backend accepts', () => {
    expect(clampDuration(1000, 4500)).toBe(3500);
    expect(clampDuration(5000, 1000)).toBe(0);
    expect(clampDuration(0, 5 * 60 * 60 * 1000)).toBe(60 * 60 * 1000);
  });
});

describe('results', () => {
  it('counts every rating, including those nobody pressed', () => {
    expect(countRatings(results)).toEqual({ AGAIN: 2, HARD: 0, GOOD: 1, EASY: 1 });
  });

  it('keeps only the cards answered Again for the retry round, in order', () => {
    expect(missedItems(results).map(i => i.cardId)).toEqual(['a', 'c']);
  });
});

describe('deadline', () => {
  const now = new Date('2026-10-04T10:00:00.000Z');

  it('counts the days left, rounded up', () => {
    expect(daysUntilEnd('2026-10-09T09:00:00.000Z', now)).toBe(5);
    expect(daysUntilEnd('2026-10-09T11:00:00.000Z', now)).toBe(6);
  });

  it('is over once the deadline has passed, and never over without one', () => {
    expect([isCycleEnded('2026-10-04T09:59:59.000Z', now), isCycleEnded('2026-10-04T10:00:01.000Z', now), isCycleEnded(null, now)]).toEqual([true, false, false]);
  });

  it('says how long is left in plain words', () => {
    expect(['2026-10-04T09:00:00.000Z', '2026-10-04T20:00:00.000Z', '2026-10-09T09:00:00.000Z'].map(date => formatDeadline(date, now))).toEqual(['Cycle ended', 'Ends today', '5 days left']);
  });
});

describe('formatting', () => {
  it('shows a short date without moving the day', () => {
    expect([formatShortDate('2026-10-07'), formatShortDate('2026-01-01'), formatShortDate('nope')]).toEqual(['Oct 07', 'Jan 01', 'nope']);
  });

  it('shows a share as a percentage, or a dash without data', () => {
    expect([formatPercent(0.9), formatPercent(0.876), formatPercent(null)]).toEqual(['90%', '88%', '—']);
  });
});
