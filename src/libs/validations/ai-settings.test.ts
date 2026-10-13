import { describe, expect, it } from 'vitest';
import { AI_MODEL_MAX_LENGTH, aiSettingInputSchema } from './ai-settings';

describe('aiSettingInputSchema', () => {
  it('accepts an allowed provider for a provider key', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'groq' });

    expect(result.success && result.data).toEqual({ key: 'ai.chat.provider', value: 'groq' });
  });

  it('rejects a provider outside the list the BE accepts, including cloudflare', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.audio.provider', value: 'cloudflare' }).success).toBe(false);
    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'OpenAI' }).success).toBe(false);
  });

  it('treats a null provider as a reset to the env default', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: null });

    expect(result.success && result.data).toEqual({ key: 'ai.chat.provider', value: null });
  });

  it('trims a model name', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.audio.model', value: '  deepgram/nova-3  ' });

    expect(result.success && result.data).toEqual({ key: 'ai.audio.model', value: 'deepgram/nova-3' });
  });

  it('treats a blank model as a reset to the env default', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.chat.model', value: '   ' });

    expect(result.success && result.data).toEqual({ key: 'ai.chat.model', value: null });
  });

  it('accepts a model name at the length limit and rejects one past it', () => {
    const atLimit = 'm'.repeat(AI_MODEL_MAX_LENGTH);
    const pastLimit = 'm'.repeat(AI_MODEL_MAX_LENGTH + 1);

    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.model', value: atLimit }).success).toBe(true);
    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.model', value: pastLimit }).success).toBe(false);
  });

  it('rejects a key outside the four AI settings', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.model', value: 'gemini-2.0-flash-lite' }).success).toBe(false);
  });

  it('rejects a model name sent to a provider key', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'gpt-4o' }).success).toBe(false);
  });
});
