import fs from 'node:fs';
import path from 'node:path';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import { describe, expect, it } from 'vitest';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { FSRS_MAX_INTERVAL_DAYS } from '@/libs/validations/vocab-trainer';
import { SRS_MAX_RETENTION, SRS_MIN_RETENTION } from '@/libs/validations/srs-settings';
import { isLocale } from './config';

type TMessageTree = { [key: string]: string | TMessageTree };

// Flattens nested messages to dot paths so both locales can be compared key by key.
function collectKeys(tree: TMessageTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [keyPath] : collectKeys(value, keyPath);
  });
}

function collectValues(tree: TMessageTree): string[] {
  return Object.values(tree).flatMap(value => (typeof value === 'string' ? [value] : collectValues(value)));
}

describe('locale messages', () => {
  it('vi.json has every key that en.json has, and no extra keys', () => {
    expect(collectKeys(vi).sort()).toEqual(collectKeys(en).sort());
  });

  it('no message value is empty', () => {
    expect(collectValues(en).every(value => value.trim().length > 0)).toBe(true);
    expect(collectValues(vi).every(value => value.trim().length > 0)).toBe(true);
  });
});

describe('isLocale', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale('../etc')).toBe(false);
  });
});

describe('validation messages', () => {
  const validationDir = path.resolve(process.cwd(), 'src/libs/validations');
  const sources = fs.readdirSync(validationDir)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map(file => fs.readFileSync(path.join(validationDir, file), 'utf8'))
    .join('\n');
  const usedKeys = [...new Set([...sources.matchAll(/'validation\.(\w+)'/g)].map(match => match[1] ?? ''))];

  it('every key used by a schema exists in both locales', () => {
    for (const key of usedKeys) {
      expect(en.validation, `en missing ${key}`).toHaveProperty(key);
      expect(vi.validation, `vi missing ${key}`).toHaveProperty(key);
    }
  });

  it('numbers in the message text match the rule they describe', () => {
    expect(en.validation.retentionOutOfRange).toContain(`${Math.round(SRS_MIN_RETENTION * 100)}%`);
    expect(en.validation.retentionOutOfRange).toContain(`${Math.round(SRS_MAX_RETENTION * 100)}%`);
    expect(en.validation.maximumIntervalOutOfRange).toContain(String(FSRS_MAX_INTERVAL_DAYS));
    expect(en.validation.trainerNameTooLong).toContain('200');
    expect(vi.validation.retentionOutOfRange).toContain(`${Math.round(SRS_MIN_RETENTION * 100)}%`);
    expect(vi.validation.maximumIntervalOutOfRange).toContain(String(FSRS_MAX_INTERVAL_DAYS));
    expect(vi.validation.trainerNameTooLong).toContain('200');
  });
});

describe('constant label keys', () => {
  it('every question type labelKey exists in both locales', () => {
    for (const option of QUESTION_TYPE_OPTIONS) {
      const key = option.labelKey.replace(/^questionTypes\./, '');
      expect(en.questionTypes, `en missing ${key}`).toHaveProperty(key);
      expect(vi.questionTypes, `vi missing ${key}`).toHaveProperty(key);
    }
  });
});
