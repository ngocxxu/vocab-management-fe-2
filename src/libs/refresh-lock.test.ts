import type { TSessionDto } from '@/types/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRefreshLock,
  getRefreshLockKey,
  invalidateRefreshLock,
  isRefreshTokenReuseError,
  performRefresh,
  RefreshLock,
  refreshMetrics,
} from '@/libs/refresh-lock';

vi.mock('@/libs/Logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('@/libs/Env', () => ({ Env: { NESTJS_API_URL: 'http://be.test/api/v1' } }));

const session = {
  access_token: 'access',
  refresh_token: 'refresh',
  user: { id: 'u1' },
} as unknown as TSessionDto;

function fakeJwt(payload: Record<string, unknown>): string {
  return `h.${btoa(JSON.stringify(payload))}.s`;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
  refreshMetrics.attempted = 0;
  refreshMetrics.deduped = 0;
  refreshMetrics.succeeded = 0;
  refreshMetrics.failed = 0;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('getRefreshLockKey', () => {
  it('uses the sub of the access token', () => {
    expect(getRefreshLockKey(fakeJwt({ sub: 'user-1' }), 'whatever-refresh')).toBe('user-1');
  });

  it('falls back to the sub of the refresh token', () => {
    expect(getRefreshLockKey('not-a-jwt', fakeJwt({ sub: 'user-2' }))).toBe('user-2');
  });

  it('falls back to the last 12 chars of an opaque refresh token', () => {
    expect(getRefreshLockKey(undefined, 'abcdefghijklmnopqrstuvwxyz')).toBe('rt_opqrstuvwxyz');
  });

  it('is anonymous for short opaque tokens or no tokens', () => {
    expect(getRefreshLockKey(undefined, 'short')).toBe('anonymous');
    expect(getRefreshLockKey()).toBe('anonymous');
  });

  it('ignores a token whose payload has no sub', () => {
    expect(getRefreshLockKey(fakeJwt({ exp: 1 }), undefined)).toBe('anonymous');
  });
});

describe('isRefreshTokenReuseError', () => {
  it('is true for 401 with an already used message', () => {
    expect(isRefreshTokenReuseError(401, { message: 'Token already used' })).toBe(true);
    expect(isRefreshTokenReuseError(401, { error: 'refresh token ALREADY USED' })).toBe(true);
  });

  it('is false for other statuses, messages and bodies', () => {
    expect(isRefreshTokenReuseError(400, { message: 'Token already used' })).toBe(false);
    expect(isRefreshTokenReuseError(401, { message: 'expired' })).toBe(false);
    expect(isRefreshTokenReuseError(401, null)).toBe(false);
    expect(isRefreshTokenReuseError(401, 'already used')).toBe(false);
  });
});

describe(RefreshLock, () => {
  it('runs one refresh for concurrent callers and shares the result', async () => {
    const lock = new RefreshLock();
    const doRefresh = vi.fn(async () => session);

    const results = await Promise.all([
      lock.getOrRefresh(doRefresh),
      lock.getOrRefresh(doRefresh),
      lock.getOrRefresh(doRefresh),
    ]);

    expect(doRefresh).toHaveBeenCalledTimes(1);
    expect(results).toEqual([session, session, session]);
    expect(refreshMetrics).toMatchObject({ attempted: 3, deduped: 2, succeeded: 1, failed: 0 });
  });

  it('serves the cached result inside the 5 second window', async () => {
    const lock = new RefreshLock();
    const doRefresh = vi.fn(async () => session);

    await lock.getOrRefresh(doRefresh);
    vi.advanceTimersByTime(4_999);
    await lock.getOrRefresh(doRefresh);

    expect(doRefresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes again once the window has passed', async () => {
    const lock = new RefreshLock();
    const doRefresh = vi.fn(async () => session);

    await lock.getOrRefresh(doRefresh);
    vi.advanceTimersByTime(5_001);
    await lock.getOrRefresh(doRefresh);

    expect(doRefresh).toHaveBeenCalledTimes(2);
  });

  it('does not cache a null result', async () => {
    const lock = new RefreshLock();
    const doRefresh = vi.fn<() => Promise<TSessionDto | null>>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(session);

    expect(await lock.getOrRefresh(doRefresh)).toBeNull();
    expect(await lock.getOrRefresh(doRefresh)).toBe(session);
    expect(doRefresh).toHaveBeenCalledTimes(2);
    expect(refreshMetrics).toMatchObject({ failed: 1, succeeded: 1 });
  });

  it('resolves null when the refresh rejects', async () => {
    const lock = new RefreshLock();

    expect(await lock.getOrRefresh(() => Promise.reject(new Error('boom')))).toBeNull();
    expect(refreshMetrics.failed).toBe(1);
  });

  it('resolves null when the refresh never settles within 10 seconds', async () => {
    const lock = new RefreshLock();
    const pending = lock.getOrRefresh(() => new Promise(() => {}));

    await vi.advanceTimersByTimeAsync(10_000);

    expect(await pending).toBeNull();
  });

  it('invalidate clears the cached result', async () => {
    const lock = new RefreshLock();
    const doRefresh = vi.fn(async () => session);

    await lock.getOrRefresh(doRefresh);
    lock.invalidate();
    await lock.getOrRefresh(doRefresh);

    expect(doRefresh).toHaveBeenCalledTimes(2);
  });
});

describe('getRefreshLock and invalidateRefreshLock', () => {
  it('returns the same lock for the same key and different locks otherwise', () => {
    expect(getRefreshLock('same-key')).toBe(getRefreshLock('same-key'));
    expect(getRefreshLock('key-a')).not.toBe(getRefreshLock('key-b'));
  });

  it('invalidates the lock found through the access token sub', async () => {
    const doRefresh = vi.fn(async () => session);
    const lock = getRefreshLock('user-invalidate');

    await lock.getOrRefresh(doRefresh);
    invalidateRefreshLock(fakeJwt({ sub: 'user-invalidate' }));
    await lock.getOrRefresh(doRefresh);

    expect(doRefresh).toHaveBeenCalledTimes(2);
  });

  it('does nothing for an unknown key', () => {
    expect(() => invalidateRefreshLock(fakeJwt({ sub: 'never-created' }))).not.toThrow();
  });
});

describe('performRefresh', () => {
  function stubFetch(response: Response | Error): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn(async () => {
      if (response instanceof Error) {
        throw response;
      }
      return response;
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('posts the refresh token and returns a valid session', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify(session), { status: 200 }));

    expect(await performRefresh('rt-1')).toEqual(session);
    expect(fetchMock).toHaveBeenCalledWith('http://be.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'rt-1' }),
    });
  });

  it('returns null for a response with the wrong shape', async () => {
    stubFetch(new Response(JSON.stringify({ foo: 1 }), { status: 200 }));
    expect(await performRefresh('rt')).toBeNull();
  });

  it('returns null for a non-JSON success body', async () => {
    stubFetch(new Response('oops', { status: 200 }));
    expect(await performRefresh('rt')).toBeNull();
  });

  it('returns null for a failed status', async () => {
    stubFetch(new Response(JSON.stringify({ message: 'Token already used' }), { status: 401 }));
    expect(await performRefresh('rt')).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    stubFetch(new Error('network'));
    expect(await performRefresh('rt')).toBeNull();
  });
});
