import { AI_CATALOG_KINDS, AI_CATALOG_PROVIDERS, AI_PROVIDERS } from '@/constants/admin';
import { z } from 'zod';

export const AI_MODEL_MAX_LENGTH = 120;

const PROVIDER_KEYS = ['ai.provider', 'ai.chat.provider', 'ai.audio.provider'] as const;
const MODEL_KEYS = ['ai.model', 'ai.chat.model', 'ai.audio.model'] as const;

const providerSettingSchema = z.object({
  key: z.enum(PROVIDER_KEYS),
  value: z.enum(AI_PROVIDERS).nullable(),
});

// A blank model means the env default, so it is stored as null, the same as a reset.
const modelSettingSchema = z.object({
  key: z.enum(MODEL_KEYS),
  value: z.string().trim().max(AI_MODEL_MAX_LENGTH).nullable().transform(value => value || null),
});

export const aiSettingInputSchema = z.union([providerSettingSchema, modelSettingSchema]);

// Only providers the BE model catalog can list. A query for OmniRoute is refused before the call.
export const aiModelCatalogInputSchema = z.object({
  provider: z.enum(AI_CATALOG_PROVIDERS),
  kind: z.enum(AI_CATALOG_KINDS),
});
