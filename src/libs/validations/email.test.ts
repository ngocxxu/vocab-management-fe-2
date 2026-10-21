import { describe, expect, it } from 'vitest';
import { emailAddressSchema } from '@/libs/validations/email';

const isPlausibleEmail = (value: string) => emailAddressSchema.safeParse(value).success;

describe('emailAddressSchema', () => {
  it('accepts an ordinary address, with surrounding spaces ignored', () => {
    expect(isPlausibleEmail('  ada@example.com ')).toBe(true);
  });

  it.each(['', 'ada', 'ada@', '@example.com', 'ada@example', 'ada @example.com', 'ada@exa mple.com'])('refuses %j', (value) => {
    expect(isPlausibleEmail(value)).toBe(false);
  });

  it('refuses an address longer than 254 characters', () => {
    expect(isPlausibleEmail(`${'a'.repeat(250)}@x.co`)).toBe(false);
  });
});
