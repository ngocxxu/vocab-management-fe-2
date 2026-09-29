import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/libs/token-broadcast', () => ({
  postTokenRefreshed: vi.fn(),
  subscribeToTokenRefresh: vi.fn(),
}));

type TDeferred = { promise: Promise<Response>; resolve: (response: Response) => void };

function deferred(): TDeferred {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function load() {
  const client = await import('@/libs/auth-refresh-client');
  const broadcast = await import('@/libs/token-broadcast');
  return { refreshAccessTokenOnce: client.refreshAccessTokenOnce, postTokenRefreshed: broadcast.postTokenRefreshed };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('refreshAccessTokenOnce', () => {
  it('shares one in-flight request between concurrent callers', async () => {
    const pending = deferred();
    const fetchMock = vi.fn(() => pending.promise);
    vi.stubGlobal('fetch', fetchMock);
    const { refreshAccessTokenOnce, postTokenRefreshed } = await load();

    const first = refreshAccessTokenOnce();
    const second = refreshAccessTokenOnce();
    pending.resolve(new Response(null, { status: 200 }));

    expect(second).toBe(first);
    expect(await first).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    expect(postTokenRefreshed).toHaveBeenCalledTimes(1);
  });

  it('starts a new request after the previous one settled', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { refreshAccessTokenOnce } = await load();

    await refreshAccessTokenOnce();
    await refreshAccessTokenOnce();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resolves false and does not broadcast on a failed status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    const { refreshAccessTokenOnce, postTokenRefreshed } = await load();

    expect(await refreshAccessTokenOnce()).toBe(false);
    expect(postTokenRefreshed).not.toHaveBeenCalled();
  });

  it('resolves false when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network');
    }));
    const { refreshAccessTokenOnce } = await load();

    expect(await refreshAccessTokenOnce()).toBe(false);
  });
});
