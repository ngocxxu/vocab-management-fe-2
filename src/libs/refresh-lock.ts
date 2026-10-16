import type { TRefreshedSession } from '@/types/auth';
import { getAuth0Config, refreshTokens } from '@/libs/auth0';
import { logger } from '@/libs/Logger';

const DEDUP_WINDOW_MS = 5_000;
const PROMISE_TIMEOUT_MS = 10_000;
const LOCK_MAP_TTL_MS = 3_600_000;

type TJwtPayload = {
  sub?: string;
  exp?: number;
};

export const refreshMetrics = {
  attempted: 0,
  deduped: 0,
  succeeded: 0,
  failed: 0,
};

function decodeJwtPayload(token: string): TJwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }
    const payload = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as unknown;
    return typeof payload === 'object' && payload !== null ? payload as TJwtPayload : null;
  } catch {
    return null;
  }
}

export function getRefreshLockKey(accessToken?: string, refreshToken?: string): string {
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.sub) {
      return payload.sub;
    }
  }

  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken);
    if (payload?.sub) {
      return payload.sub;
    }
    if (refreshToken.length >= 12) {
      return `rt_${refreshToken.slice(-12)}`;
    }
  }

  return 'anonymous';
}

export function isRefreshTokenReuseError(status: number, body: unknown): boolean {
  if (status !== 401) {
    return false;
  }

  const message = extractErrorMessage(body);
  return message.toLowerCase().includes('already used');
}

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return '';
  }

  const record = body as { message?: unknown; error?: unknown };
  if (typeof record.message === 'string') {
    return record.message;
  }
  if (typeof record.error === 'string') {
    return record.error;
  }

  return '';
}

/** Swaps the refresh token at Auth0. Null means the session is over (revoked, expired, reused) or Auth0 is unreachable. */
export async function performRefresh(refreshToken: string): Promise<TRefreshedSession | null> {
  try {
    const tokens = await refreshTokens(getAuth0Config(), refreshToken);
    if (!tokens?.refreshToken) {
      logger.debug('[refresh-lock] Auth0 refresh failed');
      return null;
    }
    return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
  } catch (error) {
    logger.error('[refresh-lock] performRefresh error', { error });
    return null;
  }
}

export class RefreshLock {
  private inflight: Promise<TRefreshedSession | null> | null = null;
  private lastResult: TRefreshedSession | null = null;
  private lastResultAt = 0;

  async getOrRefresh(
    doRefresh: () => Promise<TRefreshedSession | null>,
  ): Promise<TRefreshedSession | null> {
    refreshMetrics.attempted += 1;

    if (
      this.lastResult
      && Date.now() - this.lastResultAt < DEDUP_WINDOW_MS
    ) {
      refreshMetrics.deduped += 1;
      return this.lastResult;
    }

    if (this.inflight) {
      refreshMetrics.deduped += 1;
      return this.inflight;
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Refresh timeout')), PROMISE_TIMEOUT_MS);
    });

    this.inflight = Promise.race([
      doRefresh(),
      timeoutPromise,
    ])
      .then((result) => {
        if (result) {
          this.lastResult = result;
          this.lastResultAt = Date.now();
          refreshMetrics.succeeded += 1;
        } else {
          refreshMetrics.failed += 1;
        }
        return result;
      })
      .catch((error) => {
        refreshMetrics.failed += 1;
        logger.warn('[refresh-lock] getOrRefresh failed', { error });
        return null;
      })
      .finally(() => {
        this.inflight = null;
      });

    return this.inflight;
  }

  invalidate(): void {
    this.inflight = null;
    this.lastResult = null;
    this.lastResultAt = 0;
  }
}

const lockMap = new Map<string, RefreshLock>();

export function getRefreshLock(lockKey: string): RefreshLock {
  let lock = lockMap.get(lockKey);
  if (!lock) {
    lock = new RefreshLock();
    lockMap.set(lockKey, lock);

    setTimeout(() => {
      lockMap.delete(lockKey);
    }, LOCK_MAP_TTL_MS);
  }

  return lock;
}

export function invalidateRefreshLock(accessToken?: string, refreshToken?: string): void {
  const key = getRefreshLockKey(accessToken, refreshToken);
  lockMap.get(key)?.invalidate();
}
