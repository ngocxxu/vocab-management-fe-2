import { describe, expect, it } from 'vitest';
import { isLanguageInUse } from './catalog-usage';

describe('isLanguageInUse', () => {
  it('is in use when a vocab uses the language', () => {
    expect(isLanguageInUse({ vocabCount: 1, folderCount: 0 })).toBe(true);
  });

  it('is in use when a folder uses the language', () => {
    expect(isLanguageInUse({ vocabCount: 0, folderCount: 2 })).toBe(true);
  });

  it('is not in use when nothing uses the language', () => {
    expect(isLanguageInUse({ vocabCount: 0, folderCount: 0 })).toBe(false);
  });
});
