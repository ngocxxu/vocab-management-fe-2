import { unstable_cache } from 'next/cache';
import type { ResponseAPI, TLanguage, TWordTypeResponse } from '@/types';
import { Env } from '@/libs/Env';
import { API_ENDPOINTS } from '@/utils/api-config';

const REFERENCE_REVALIDATE_SECONDS = 3600;

async function getPublicBackendJson<T>(endpoint: string): Promise<T> {
  const baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';
  const response = await fetch(`${baseURL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: REFERENCE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${endpoint}`);
  }

  return response.json() as Promise<T>;
}

export const getCachedLanguages = unstable_cache(
  () => getPublicBackendJson<ResponseAPI<TLanguage[]>>(API_ENDPOINTS.languages),
  ['reference-data', 'languages'],
  { revalidate: REFERENCE_REVALIDATE_SECONDS, tags: ['languages'] },
);

export const getCachedWordTypes = unstable_cache(
  () => getPublicBackendJson<TWordTypeResponse>(API_ENDPOINTS.wordTypes),
  ['reference-data', 'word-types'],
  { revalidate: REFERENCE_REVALIDATE_SECONDS, tags: ['word-types'] },
);
