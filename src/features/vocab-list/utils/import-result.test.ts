import type { TCsvImportResponse } from '@/types/vocab-list';
import { describe, expect, it } from 'vitest';
import { extractSubjectName, getVisibleDataEntries, isNothingSaved } from './import-result';

const importResult = (overrides: Partial<TCsvImportResponse>): TCsvImportResponse => ({
  created: 0,
  updated: 0,
  failed: 0,
  totalProcessed: 0,
  errors: [],
  ...overrides,
});

describe('isNothingSaved', () => {
  it('is true when rows failed and no word was created or updated', () => {
    expect(isNothingSaved(importResult({ failed: 1, totalProcessed: 5 }))).toBe(true);
  });

  it('is false when at least one word was created', () => {
    expect(isNothingSaved(importResult({ created: 1, failed: 1 }))).toBe(false);
  });

  it('is false when at least one word was updated', () => {
    expect(isNothingSaved(importResult({ updated: 2, failed: 1 }))).toBe(false);
  });

  it('is false when nothing failed', () => {
    expect(isNothingSaved(importResult({ created: 0, updated: 0, failed: 0 }))).toBe(false);
  });
});

describe('extractSubjectName', () => {
  it('returns the subject name from a missing-subject error', () => {
    expect(extractSubjectName('Subject \'Food\' not found')).toBe('Food');
  });

  it('keeps an apostrophe inside the subject name', () => {
    expect(extractSubjectName('Subject \'Children\'s books\' not found')).toBe('Children\'s books');
  });

  it('returns null for an error that is not about a missing subject', () => {
    expect(extractSubjectName('Invalid CEFR level')).toBeNull();
  });
});

describe('getVisibleDataEntries', () => {
  it('returns no entries for empty data, as for a file-level error', () => {
    expect(getVisibleDataEntries({})).toEqual([]);
  });

  it('returns no entries when the backend sends no data', () => {
    expect(getVisibleDataEntries(undefined)).toEqual([]);
  });

  it('hides null, undefined and blank values', () => {
    expect(getVisibleDataEntries({ word: 'apple', note: null, example: undefined, meaning: '  ' }))
      .toEqual([['word', 'apple']]);
  });

  it('keeps zero and false, which are real values', () => {
    expect(getVisibleDataEntries({ order: 0, active: false })).toEqual([['order', '0'], ['active', 'false']]);
  });
});
