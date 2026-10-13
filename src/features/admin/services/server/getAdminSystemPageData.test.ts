import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { readAiSettings } from './getAdminSystemPageData';

const configApi = vi.hoisted(() => ({ getSystem: vi.fn() }));

vi.mock('@/utils/server-api', () => ({ configApi, cacheApi: {} }));

// Stored values as the BE returns them. The expected results below are these literals, not recomputed.
const STORED = {
  'ai.chat.provider': 'groq',
  'ai.chat.model': 'gemini-2.0-flash-lite',
  'ai.audio.provider': 'omniroute',
  'ai.audio.model': 'deepgram/nova-3',
} as const;

describe('readAiSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the stored value of each of the four keys', async () => {
    configApi.getSystem.mockImplementation(async (key: keyof typeof STORED) => ({ key, value: STORED[key] }));

    const settings = await readAiSettings();

    expect(settings).toEqual({
      'ai.chat.provider': 'groq',
      'ai.chat.model': 'gemini-2.0-flash-lite',
      'ai.audio.provider': 'omniroute',
      'ai.audio.model': 'deepgram/nova-3',
    });
  });

  it('reads a key the BE does not have as unset, so the env default applies', async () => {
    configApi.getSystem.mockRejectedValue(new BackendRequestError('Not Found', 404, {}));

    const settings = await readAiSettings();

    expect(settings).toEqual({
      'ai.chat.provider': null,
      'ai.chat.model': null,
      'ai.audio.provider': null,
      'ai.audio.model': null,
    });
  });

  it('rethrows any failure other than a missing key', async () => {
    configApi.getSystem.mockRejectedValue(new BackendRequestError('Internal Server Error', 500, {}));

    await expect(readAiSettings()).rejects.toThrow('Internal Server Error');
  });

  it('reads a stored value that is not a string as unset', async () => {
    configApi.getSystem.mockResolvedValue({ key: 'ai.chat.model', value: 42 });

    const settings = await readAiSettings();

    expect(settings['ai.chat.model']).toBeNull();
  });
});
