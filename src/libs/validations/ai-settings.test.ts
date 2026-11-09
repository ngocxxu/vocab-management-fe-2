import { describe, expect, it } from 'vitest';
import { AI_MODEL_MAX_LENGTH, aiModelCatalogInputSchema, aiSettingInputSchema } from './ai-settings';

describe('aiSettingInputSchema', () => {
  it('accepts an allowed provider for a provider key', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'groq' });

    expect(result.success && result.data).toEqual({ key: 'ai.chat.provider', value: 'groq' });
  });

  it('accepts cloudflare for a provider key', () => {
    const result = aiSettingInputSchema.safeParse({ key: 'ai.audio.provider', value: 'cloudflare' });

    expect(result.success && result.data).toEqual({ key: 'ai.audio.provider', value: 'cloudflare' });
  });

  it('rejects a provider outside the list the BE accepts', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'OpenAI' }).success).toBe(false);
  });

  it('accepts the default provider and model keys', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.provider', value: 'cloudflare' }).success).toBe(true);
    expect(aiSettingInputSchema.safeParse({ key: 'ai.model', value: '@cf/qwen/qwen3-30b-a3b-fp8' }).success).toBe(true);
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

  it('rejects a key outside the AI settings', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.embedding.model', value: 'text-embedding-004' }).success).toBe(false);
  });

  it('rejects a model name sent to a provider key', () => {
    expect(aiSettingInputSchema.safeParse({ key: 'ai.chat.provider', value: 'gpt-4o' }).success).toBe(false);
  });
});

describe('aiModelCatalogInputSchema', () => {
  it('accepts a catalog provider and kind', () => {
    expect(aiModelCatalogInputSchema.safeParse({ provider: 'cloudflare', kind: 'audio' }).success).toBe(true);
  });

  it('rejects OmniRoute, which has no model list', () => {
    expect(aiModelCatalogInputSchema.safeParse({ provider: 'omniroute', kind: 'text' }).success).toBe(false);
  });

  it('rejects an unknown kind', () => {
    expect(aiModelCatalogInputSchema.safeParse({ provider: 'groq', kind: 'image' }).success).toBe(false);
  });
});
