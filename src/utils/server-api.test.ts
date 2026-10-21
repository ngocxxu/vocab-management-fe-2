import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAccessToken = vi.fn();
const getRefreshToken = vi.fn();
const setAuthCookies = vi.fn();
const getOrRefresh = vi.fn();

vi.mock('@/utils/auth-cookies', () => ({
  getAccessToken: () => getAccessToken(),
  getRefreshToken: () => getRefreshToken(),
  setAuthCookies: (...args: unknown[]) => setAuthCookies(...args),
}));
vi.mock('@/libs/refresh-lock', () => ({
  getRefreshLockKey: () => 'lock-key',
  getRefreshLock: () => ({ getOrRefresh }),
  performRefresh: vi.fn(),
}));
vi.mock('@/libs/Env', () => ({ Env: { NESTJS_API_URL: 'http://be.test' } }));
vi.mock('@/libs/Logger', () => ({ logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const { languageFoldersApi } = await import('@/utils/server-api');

const json = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('serverApi refresh on 401', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getAccessToken.mockResolvedValue('old-access');
    getRefreshToken.mockResolvedValue('refresh');
  });

  it('refreshes once and retries the call with the new token', async () => {
    fetchMock.mockResolvedValueOnce(json(401)).mockResolvedValueOnce(json(200, { items: [] }));
    getOrRefresh.mockResolvedValue({ access_token: 'new-access', refresh_token: 'new-refresh' });

    await expect(languageFoldersApi.getMy()).resolves.toEqual({ items: [] });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![1].headers.Authorization).toBe('Bearer new-access');
    expect(setAuthCookies).toHaveBeenCalledWith('new-access', 'new-refresh');
  });

  it('throws the 401 when there is no refresh token, without calling the backend twice', async () => {
    fetchMock.mockResolvedValueOnce(json(401));
    getRefreshToken.mockResolvedValue(undefined);

    await expect(languageFoldersApi.getMy()).rejects.toMatchObject({ statusCode: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws the 401 when the refresh fails', async () => {
    fetchMock.mockResolvedValueOnce(json(401));
    getOrRefresh.mockResolvedValue(null);

    await expect(languageFoldersApi.getMy()).rejects.toMatchObject({ statusCode: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when the first call succeeds', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { items: [] }));

    await languageFoldersApi.getMy();

    expect(getOrRefresh).not.toHaveBeenCalled();
  });
});
