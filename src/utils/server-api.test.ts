import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAccessToken = vi.fn();
const getLocaleCookie = vi.fn();
const getRefreshToken = vi.fn();
const setAuthCookies = vi.fn();
const getOrRefresh = vi.fn();

vi.mock('@/utils/auth-cookies', () => ({
  getAccessToken: () => getAccessToken(),
  getLocaleCookie: () => getLocaleCookie(),
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

const { languageFoldersApi, vocabApi } = await import('@/utils/server-api');

const json = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('serverApi Accept-Language header', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getAccessToken.mockResolvedValue('token');
  });

  it('sends the UI locale cookie as Accept-Language', async () => {
    getLocaleCookie.mockResolvedValue('vi');
    fetchMock.mockResolvedValueOnce(json(200, { items: [] }));

    await languageFoldersApi.getMy();

    expect(fetchMock.mock.calls[0]![1].headers['Accept-Language']).toBe('vi');
  });

  it('omits Accept-Language when the locale cookie is missing', async () => {
    getLocaleCookie.mockResolvedValue(undefined);
    fetchMock.mockResolvedValueOnce(json(200, { items: [] }));

    await languageFoldersApi.getMy();

    expect(fetchMock.mock.calls[0]![1].headers).not.toHaveProperty('Accept-Language');
  });
});

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

describe('serverApi CSV import and export', () => {
  const fetchMock = vi.fn();
  const csvFile = new File(['word,meaning\napple,táo'], 'words.csv', { type: 'text/csv' });
  const importParams = { languageFolderId: 'folder-1', sourceLanguageCode: 'en', targetLanguageCode: 'vi' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getAccessToken.mockResolvedValue('old-access');
    getRefreshToken.mockResolvedValue('refresh');
    getLocaleCookie.mockResolvedValue(undefined);
    fetchMock.mockReset();
    getOrRefresh.mockReset();
  });

  it('sends the file as multipart without forcing a JSON content type', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { created: 1, updated: 0, failed: 0, totalProcessed: 1 }));

    await vocabApi.importCsv(csvFile, importParams);

    const init = fetchMock.mock.calls[0]![1];
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).not.toHaveProperty('Content-Type');
  });

  it('refreshes once on 401 and retries the import with the same file', async () => {
    const summary = { created: 1, updated: 0, failed: 0, totalProcessed: 1 };
    fetchMock.mockResolvedValueOnce(json(401)).mockResolvedValueOnce(json(200, summary));
    getOrRefresh.mockResolvedValue({ access_token: 'new-access', refresh_token: 'new-refresh' });

    await expect(vocabApi.importCsv(csvFile, importParams)).resolves.toEqual(summary);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![1].headers.Authorization).toBe('Bearer new-access');
    expect(fetchMock.mock.calls[1]![1].body).toBe(fetchMock.mock.calls[0]![1].body);
  });

  it('rejects with the backend error body so the real reason can be shown', async () => {
    const errorBody = {
      statusCode: 400,
      error: 'Bad Request',
      message: 'CSV header is missing',
      timestamp: '2026-11-27T00:00:00.000Z',
      path: '/api/v1/vocabs/import/csv',
    };
    fetchMock.mockResolvedValueOnce(json(400, errorBody));

    await expect(vocabApi.importCsv(csvFile, importParams)).rejects.toMatchObject({
      name: 'BackendRequestError',
      statusCode: 400,
      body: errorBody,
    });
  });

  it('refreshes once on 401 when exporting the CSV', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('word\napple\n', { status: 200, headers: { 'content-type': 'text/csv' } }));
    getOrRefresh.mockResolvedValue({ access_token: 'new-access', refresh_token: 'new-refresh' });

    const response = await vocabApi.exportCsv({ userId: 'user-1' });

    expect(await response.text()).toBe('word\napple\n');
    expect(fetchMock.mock.calls[1]![1].headers.Authorization).toBe('Bearer new-access');
  });
});
