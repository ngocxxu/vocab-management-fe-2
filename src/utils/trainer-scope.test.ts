// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  folderMatchesScope,
  getLastTrainerScope,
  isAllScope,
  scopeParam,
  setLastTrainerScope,
} from '@/utils/trainer-scope';

const STORAGE_KEY = 'vocab-trainer:last-scope';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('last trainer scope storage', () => {
  it('round-trips a scope', () => {
    setLastTrainerScope({ sourceLanguageCode: 'en', targetLanguageCode: 'vi' });
    expect(getLastTrainerScope()).toEqual({ sourceLanguageCode: 'en', targetLanguageCode: 'vi' });
  });

  it('returns null when nothing is stored', () => {
    expect(getLastTrainerScope()).toBeNull();
  });

  it('returns null for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(getLastTrainerScope()).toBeNull();
  });

  it('returns null when the stored shape is wrong', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sourceLanguageCode: 'en' }));
    expect(getLastTrainerScope()).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => setLastTrainerScope({ sourceLanguageCode: 'en', targetLanguageCode: 'vi' })).not.toThrow();
  });
});

describe('isAllScope', () => {
  it('is true only when both codes are ALL', () => {
    expect(isAllScope('ALL', 'ALL')).toBe(true);
    expect(isAllScope('ALL', 'vi')).toBe(false);
    expect(isAllScope('en', 'ALL')).toBe(false);
  });
});

describe('scopeParam', () => {
  it('maps ALL to undefined and keeps real codes', () => {
    expect(scopeParam('ALL')).toBeUndefined();
    expect(scopeParam('en')).toBe('en');
  });
});

describe('folderMatchesScope', () => {
  const folder = { sourceLanguageCode: 'en', targetLanguageCode: 'vi' };

  it('matches when both codes are ALL', () => {
    expect(folderMatchesScope(folder, 'ALL', 'ALL')).toBe(true);
  });

  it('matches an exact source and target', () => {
    expect(folderMatchesScope(folder, 'en', 'vi')).toBe(true);
  });

  it('matches one side when the other is ALL', () => {
    expect(folderMatchesScope(folder, 'en', 'ALL')).toBe(true);
    expect(folderMatchesScope(folder, 'ALL', 'vi')).toBe(true);
  });

  it('does not match when either side differs', () => {
    expect(folderMatchesScope(folder, 'ko', 'vi')).toBe(false);
    expect(folderMatchesScope(folder, 'en', 'ko')).toBe(false);
  });
});
