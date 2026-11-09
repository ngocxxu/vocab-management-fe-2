// Role and sort values the admin users table accepts. The TypeScript types are derived from these lists.
export const ADMIN_USER_ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

export const ADMIN_USER_SORT_FIELDS = ['createdAt', 'email'] as const;

// Plan limits: -1 means unlimited. The cap is an int32, the same bound the BE accepts.
export const ADMIN_PLAN_UNLIMITED = -1;
export const ADMIN_PLAN_MAX_LIMIT = 2_147_483_647;

// The limits a plan sets in the form. requestsPerMinute is stored by the BE but never edited here.
export const ADMIN_PLAN_LIMIT_KEYS = ['vocabPerDay', 'languageFolders', 'subjects'] as const;

// The six AI settings, as the BE stores them in the config table. Each provider key takes one of AI_PROVIDERS; each model key takes a model id.
export const AI_SETTING_KEYS = [
  'ai.provider',
  'ai.model',
  'ai.chat.provider',
  'ai.chat.model',
  'ai.audio.provider',
  'ai.audio.model',
] as const;

// The providers the BE ConfigPipe accepts on save. OmniRoute is accepted but has no model list.
export const AI_PROVIDERS = ['gemini', 'openrouter', 'groq', 'omniroute', 'cloudflare'] as const;

// The providers the BE model catalog lists models for. OmniRoute is left out, so its model fields get no suggestions.
export const AI_CATALOG_PROVIDERS = ['gemini', 'openrouter', 'groq', 'cloudflare'] as const;

// Text models for chat and generation, audio models for transcription.
export const AI_CATALOG_KINDS = ['text', 'audio'] as const;
