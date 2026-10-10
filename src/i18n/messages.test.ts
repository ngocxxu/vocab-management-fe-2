import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import { describe, expect, it } from 'vitest';
import { isLocale } from './config';

type TMessageTree = { [key: string]: string | TMessageTree };

// Flattens nested messages to dot paths so both locales can be compared key by key.
function collectKeys(tree: TMessageTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : collectKeys(value, path);
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
