import { describe, expect, it } from 'vitest';
import { fromSelectValue, isSettingChanged, toSelectValue, toSettingValue } from './ai-setting-draft';

describe('ai setting draft', () => {
  it('maps an empty draft to the env-default option and back', () => {
    expect(toSelectValue('')).toBe('env-default');
    expect(fromSelectValue('env-default')).toBe('');
  });

  it('keeps a provider draft as its own option value', () => {
    expect(toSelectValue('groq')).toBe('groq');
    expect(fromSelectValue('openrouter')).toBe('openrouter');
  });

  it('trims a draft into the stored value', () => {
    expect(toSettingValue('  groq ')).toBe('groq');
  });

  it('turns a blank draft into null, which means reset to env default', () => {
    expect(toSettingValue('   ')).toBeNull();
    expect(toSettingValue('')).toBeNull();
  });

  it('is changed when a new value is typed over an unset setting', () => {
    expect(isSettingChanged('groq', null)).toBe(true);
  });

  it('is not changed when a blank draft sits over an unset setting', () => {
    expect(isSettingChanged('   ', null)).toBe(false);
  });

  it('is not changed when the draft matches the stored value', () => {
    expect(isSettingChanged('groq', 'groq')).toBe(false);
  });

  it('is changed when the draft is cleared over a stored value', () => {
    expect(isSettingChanged('', 'groq')).toBe(true);
  });
});
