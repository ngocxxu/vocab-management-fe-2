import type { TPlan } from '@/types/plan';
import { Env } from '@/libs/Env';
import { API_ENDPOINTS } from '@/utils/api-config';

const REVALIDATE_SECONDS = 0;
const baseURL = () => Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';

function isPlanLike(value: unknown): value is TPlan {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o.role === 'string'
    && typeof o.name === 'string'
    && typeof o.price === 'number'
    && typeof o.priceLabel === 'string'
    && Array.isArray(o.features)
    && o.limits != null
    && typeof o.limits === 'object'
  );
}

export async function getPlans(): Promise<TPlan[]> {
  try {
    const url = `${baseURL()}${API_ENDPOINTS.plans}`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter(isPlanLike);
  } catch {
    return [];
  }
}
