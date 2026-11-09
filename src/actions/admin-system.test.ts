import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { clearAdminCaches, listAdminAiModels, saveAdminAiSetting } from './admin-system';

const revalidatePath = vi.hoisted(() => vi.fn());
const requireAdmin = vi.hoisted(() => vi.fn());
const configApi = vi.hoisted(() => ({ setSystem: vi.fn(), deleteSystem: vi.fn(), listModels: vi.fn() }));
const cacheApi = vi.hoisted(() => ({ clear: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('./auth', () => ({ requireAdmin }));
vi.mock('./utils', () => ({
  toActionError: vi.fn(async (_error: unknown, key: string) => new Error(key)),
  translateError: vi.fn(async (key: string) => key),
}));
vi.mock('@/utils/server-api', () => ({ configApi, cacheApi }));

describe('admin system actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue(undefined);
  });

  describe('saveAdminAiSetting', () => {
    it('writes a provider value and refreshes the system page', async () => {
      configApi.setSystem.mockResolvedValue({ key: 'ai.chat.provider', value: 'groq' });

      await saveAdminAiSetting({ key: 'ai.chat.provider', value: 'groq' });

      expect(configApi.setSystem).toHaveBeenCalledWith('ai.chat.provider', 'groq');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/system');
    });

    it('deletes the key when the value is a reset to the env default', async () => {
      configApi.deleteSystem.mockResolvedValue({ key: 'ai.chat.model' });

      await saveAdminAiSetting({ key: 'ai.chat.model', value: '   ' });

      expect(configApi.deleteSystem).toHaveBeenCalledWith('ai.chat.model');
      expect(configApi.setSystem).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/admin/system');
    });

    it('counts a reset of a key that is already gone as a success', async () => {
      configApi.deleteSystem.mockRejectedValue(new BackendRequestError('Not Found', 404, {}));

      await expect(saveAdminAiSetting({ key: 'ai.audio.model', value: null })).resolves.toBeUndefined();

      expect(revalidatePath).toHaveBeenCalledWith('/admin/system');
    });

    it('rejects a provider outside the allowed list before calling the API', async () => {
      await expect(saveAdminAiSetting({ key: 'ai.audio.provider', value: 'OpenAI' })).rejects.toThrow('adminInvalidInput');

      expect(configApi.setSystem).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('does not refresh when the API refuses the save', async () => {
      configApi.setSystem.mockRejectedValue(new Error('AI provider must be one of'));

      await expect(saveAdminAiSetting({ key: 'ai.chat.provider', value: 'groq' })).rejects.toThrow('adminSaveAiSetting');

      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('checks the admin role before anything else', async () => {
      requireAdmin.mockRejectedValue(new Error('Forbidden'));

      await expect(saveAdminAiSetting({ key: 'ai.chat.provider', value: 'groq' })).rejects.toThrow('Forbidden');

      expect(configApi.setSystem).not.toHaveBeenCalled();
    });
  });

  describe('listAdminAiModels', () => {
    it('returns the catalog the BE reports for the provider and kind', async () => {
      const catalog = { provider: 'groq', kind: 'text', models: [{ id: 'openai/gpt-oss-120b', name: 'openai/gpt-oss-120b' }], degraded: false };
      configApi.listModels.mockResolvedValue(catalog);

      await expect(listAdminAiModels({ provider: 'groq', kind: 'text' })).resolves.toEqual(catalog);

      expect(configApi.listModels).toHaveBeenCalledWith('groq', 'text');
    });

    it('rejects OmniRoute before calling the API', async () => {
      const input = { provider: 'omniroute', kind: 'text' } as unknown as Parameters<typeof listAdminAiModels>[0];

      await expect(listAdminAiModels(input)).rejects.toThrow('adminInvalidInput');

      expect(configApi.listModels).not.toHaveBeenCalled();
    });

    it('reports a failed fetch under its own message', async () => {
      configApi.listModels.mockRejectedValue(new Error('Bad gateway'));

      await expect(listAdminAiModels({ provider: 'groq', kind: 'text' })).rejects.toThrow('adminListAiModels');
    });

    it('checks the admin role before listing', async () => {
      requireAdmin.mockRejectedValue(new Error('Forbidden'));

      await expect(listAdminAiModels({ provider: 'groq', kind: 'text' })).rejects.toThrow('Forbidden');

      expect(configApi.listModels).not.toHaveBeenCalled();
    });
  });

  describe('clearAdminCaches', () => {
    it('clears the app caches and refreshes the system page', async () => {
      cacheApi.clear.mockResolvedValue({ message: 'All caches cleared successfully' });

      await clearAdminCaches();

      expect(cacheApi.clear).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/admin/system');
    });

    it('reports a failed clear under its own message', async () => {
      cacheApi.clear.mockRejectedValue(new Error('Redis unavailable'));

      await expect(clearAdminCaches()).rejects.toThrow('adminClearCache');

      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('checks the admin role before clearing', async () => {
      requireAdmin.mockRejectedValue(new Error('Forbidden'));

      await expect(clearAdminCaches()).rejects.toThrow('Forbidden');

      expect(cacheApi.clear).not.toHaveBeenCalled();
    });
  });
});
