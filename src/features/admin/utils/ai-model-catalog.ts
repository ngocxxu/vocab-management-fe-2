import type { TAiCatalogProvider } from '@/types/admin';
import { AI_CATALOG_PROVIDERS } from '@/constants/admin';

export type TAiModelCatalogStatus = 'idle' | 'loading' | 'ready' | 'degraded';

type TCatalogHint = 'pickProvider' | 'unsupported' | 'loading' | 'degraded';

/** The catalog provider for a stored provider value. Null when the BE lists no models for it: OmniRoute, or unset. */
export function toCatalogProvider(value: string | null): TAiCatalogProvider | null {
  return AI_CATALOG_PROVIDERS.find(provider => provider === value) ?? null;
}

/** What a model field says about its suggestions, or null when there is nothing to say. */
export function getCatalogHint(
  providerValue: string | null,
  catalogProvider: TAiCatalogProvider | null,
  status: TAiModelCatalogStatus,
): TCatalogHint | null {
  if (providerValue === null) {
    return 'pickProvider';
  }
  if (catalogProvider === null) {
    return 'unsupported';
  }
  if (status === 'loading') {
    return 'loading';
  }
  if (status === 'degraded') {
    return 'degraded';
  }
  return null;
}
