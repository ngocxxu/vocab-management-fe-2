import { describe, expect, it } from 'vitest';
import { getCatalogHint, toCatalogProvider } from './ai-model-catalog';

describe('toCatalogProvider', () => {
  it('keeps a provider the BE lists models for', () => {
    expect(toCatalogProvider('cloudflare')).toBe('cloudflare');
  });

  it('returns null for OmniRoute, which has no model list', () => {
    expect(toCatalogProvider('omniroute')).toBeNull();
  });

  it('returns null when no provider is stored', () => {
    expect(toCatalogProvider(null)).toBeNull();
  });
});

describe('getCatalogHint', () => {
  it('asks for a provider when none is stored', () => {
    expect(getCatalogHint(null, null, 'idle')).toBe('pickProvider');
  });

  it('says so when the provider has no model list', () => {
    expect(getCatalogHint('omniroute', null, 'idle')).toBe('unsupported');
  });

  it('shows loading while the list is fetched', () => {
    expect(getCatalogHint('groq', 'groq', 'loading')).toBe('loading');
  });

  it('shows degraded when the provider could not be reached', () => {
    expect(getCatalogHint('groq', 'groq', 'degraded')).toBe('degraded');
  });

  it('shows nothing once the list is ready', () => {
    expect(getCatalogHint('groq', 'groq', 'ready')).toBeNull();
  });
});
