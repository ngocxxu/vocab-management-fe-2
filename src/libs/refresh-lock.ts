import type { TSessionDto } from '@/types/auth';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';

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

function isValidSession(data: unknown): data is TSessionDto {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const session = data as Partial<TSessionDto>;
  return (
    typeof session.access_token === 'string'
    && session.access_token.length > 0
    && typeof session.refresh_token === 'string'
    && session.refresh_token.length > 0
    && !!session.user
    && typeof session.user === 'object'
  );
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

export async function performRefresh(refreshToken: string): Promise<TSessionDto | null> {
  const baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';

  try {
    const response = await fetch(`${baseURL}${API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const responseText = await response.text();
    let data: unknown = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText) as unknown;
      } catch {
        data = { error: responseText };
      }
    }

    if (!response.ok) {
      logger.debug('[refresh-lock] Backend refresh failed', {
        status: response.status,
        reuse: isRefreshTokenReuseError(response.status, data),
      });
      return null;
    }

    if (!isValidSession(data)) {
      logger.warn('[refresh-lock] Backend returned invalid session shape');
      return null;
    }

    return data;
  } catch (error) {
    logger.error('[refresh-lock] performRefresh error', { error });
    return null;
  }
}

export class RefreshLock {
  private inflight: Promise<TSessionDto | null> | null = null;
  private lastResult: TSessionDto | null = null;
  private lastResultAt = 0;

  async getOrRefresh(
    doRefresh: () => Promise<TSessionDto | null>,
  ): Promise<TSessionDto | null> {
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
