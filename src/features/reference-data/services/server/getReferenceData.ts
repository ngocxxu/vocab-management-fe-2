import type { ResponseAPI, TLanguage, TWordTypeResponse } from '@/types';
import { Env } from '@/libs/Env';
import { API_ENDPOINTS } from '@/utils/api-config';

// No Next cache here: it lives on each pod's disk, so an admin edit would show on one pod and stay stale on the other.
// The BE already caches these lists in Redis, which both pods share.
async function getPublicBackendJson<T>(endpoint: string): Promise<T> {
  const baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';
  const response = await fetch(`${baseURL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${endpoint}`);
  }

  return response.json() as Promise<T>;
}

export const fetchLanguages = () => getPublicBackendJson<ResponseAPI<TLanguage[]>>(API_ENDPOINTS.languages);

export const fetchWordTypes = () => getPublicBackendJson<TWordTypeResponse>(API_ENDPOINTS.wordTypes);
