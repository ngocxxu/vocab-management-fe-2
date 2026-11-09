// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAiModelCatalog } from './useAiModelCatalog';

const listAdminAiModels = vi.hoisted(() => vi.fn());

vi.mock('@/actions/admin-system', () => ({ listAdminAiModels }));

const READY_CATALOG = {
  provider: 'groq',
  kind: 'text',
  models: [{ id: 'openai/gpt-oss-120b', name: 'openai/gpt-oss-120b' }],
  degraded: false,
};

describe('useAiModelCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stays idle and asks for nothing when there is no provider', () => {
    const { result } = renderHook(() => useAiModelCatalog(null, 'text'));

    expect(result.current).toEqual({ status: 'idle', models: [] });
    expect(listAdminAiModels).not.toHaveBeenCalled();
  });

  it('loads the models for the provider and kind', async () => {
    listAdminAiModels.mockResolvedValue(READY_CATALOG);

    const { result } = renderHook(() => useAiModelCatalog('groq', 'text'));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(listAdminAiModels).toHaveBeenCalledWith({ provider: 'groq', kind: 'text' });
    expect(result.current.models).toEqual(READY_CATALOG.models);
  });

  it('reports degraded when the BE could not reach the provider', async () => {
    listAdminAiModels.mockResolvedValue({ ...READY_CATALOG, models: [], degraded: true });

    const { result } = renderHook(() => useAiModelCatalog('groq', 'text'));

    await waitFor(() => expect(result.current.status).toBe('degraded'));
    expect(result.current.models).toEqual([]);
  });

  it('reports degraded with no models when the call itself fails', async () => {
    listAdminAiModels.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAiModelCatalog('groq', 'text'));

    await waitFor(() => expect(result.current.status).toBe('degraded'));
    expect(result.current.models).toEqual([]);
  });
});
