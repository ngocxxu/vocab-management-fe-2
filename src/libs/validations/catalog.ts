import { z } from 'zod';

// Same pattern as the BE LanguageInput: a lowercase language, optionally with an uppercase region, e.g. en, vi, en-US.
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

// The name and description limits mirror the BE DTOs (LanguageInput, WordTypeInput).
export const languageFormSchema = z.object({
  code: z.string().regex(LANGUAGE_CODE_PATTERN),
  name: z.string().trim().min(1).max(100),
});

export const wordTypeFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
});

export const catalogIdSchema = z.string().trim().min(1);
