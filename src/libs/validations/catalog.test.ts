import { describe, expect, it } from 'vitest';
import { languageFormSchema, wordTypeFormSchema } from './catalog';

describe('languageFormSchema', () => {
  it.each(['en', 'vi', 'zh', 'en-US', 'zh-TW'])('accepts the code %s', (code) => {
    expect(languageFormSchema.safeParse({ code, name: 'English' }).success).toBe(true);
  });

  it.each(['EN', 'english', 'en-us', 'e', 'en_US', 'en-USA', ' en', ''])('rejects the code %j', (code) => {
    expect(languageFormSchema.safeParse({ code, name: 'English' }).success).toBe(false);
  });

  it('rejects a blank name and a name over 100 characters', () => {
    expect(languageFormSchema.safeParse({ code: 'en', name: '   ' }).success).toBe(false);
    expect(languageFormSchema.safeParse({ code: 'en', name: 'x'.repeat(101) }).success).toBe(false);
  });

  it('trims the name', () => {
    const result = languageFormSchema.safeParse({ code: 'en', name: '  English  ' });

    expect(result.success && result.data.name).toBe('English');
  });
});

describe('wordTypeFormSchema', () => {
  const valid = { name: 'Noun', description: 'A person, place or thing' };

  it('accepts a name and description inside their limits', () => {
    expect(wordTypeFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a blank name and a name over 100 characters', () => {
    expect(wordTypeFormSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false);
    expect(wordTypeFormSchema.safeParse({ ...valid, name: 'x'.repeat(101) }).success).toBe(false);
  });

  it('rejects a blank description and one over 500 characters', () => {
    expect(wordTypeFormSchema.safeParse({ ...valid, description: '' }).success).toBe(false);
    expect(wordTypeFormSchema.safeParse({ ...valid, description: 'x'.repeat(501) }).success).toBe(false);
  });
});
