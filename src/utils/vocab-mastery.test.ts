import { describe, expect, it } from 'vitest';
import {
  clampMasteryPercent,
  getMasteryDisplay,
  getMasteryStatus,
  getMasteryStatusFromStats,
} from '@/utils/vocab-mastery';

describe('getMasteryStatus', () => {
  it.each([
    [undefined, 'Unstarted'],
    [Number.NaN, 'Unstarted'],
    [-3, 'Unstarted'],
    [0, 'Unstarted'],
    [0.5, 'Beginner'],
    [3.99, 'Beginner'],
    [4, 'Learning'],
    [7.99, 'Learning'],
    [8, 'Mastered'],
    [10, 'Mastered'],
    [99, 'Mastered'],
  ])('maps score %s to %s', (score, expected) => {
    expect(getMasteryStatus(score)).toBe(expected);
  });
});

describe('getMasteryStatusFromStats', () => {
  it('is Unstarted when the folder has no vocab, whatever the average', () => {
    expect(getMasteryStatusFromStats(9, 0)).toBe('Unstarted');
  });

  it('treats a null or undefined average as 0', () => {
    expect(getMasteryStatusFromStats(null, 5)).toBe('Unstarted');
    expect(getMasteryStatusFromStats(undefined, undefined)).toBe('Unstarted');
  });

  it('uses the average when vocab exist', () => {
    expect(getMasteryStatusFromStats(5, 3)).toBe('Learning');
  });
});

describe('getMasteryDisplay', () => {
  it('returns matching label and kind', () => {
    expect(getMasteryDisplay(9)).toEqual({ label: 'Mastered', kind: 'mastered' });
    expect(getMasteryDisplay()).toEqual({ label: 'Unstarted', kind: 'unstarted' });
  });
});

describe('clampMasteryPercent', () => {
  it.each([
    [undefined, 0],
    [-3, 0],
    [5, 50],
    [10, 100],
    [20, 100],
  ])('maps score %s to %s percent', (score, expected) => {
    expect(clampMasteryPercent(score)).toBe(expected);
  });
});
