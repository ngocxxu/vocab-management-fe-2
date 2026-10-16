import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, performRefresh } from '@/libs/refresh-lock';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '@/utils/auth-cookies';

// POST /api/auth/refresh - Refresh authentication token
export async function POST(request: NextRequest) {
  try {
    let refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      try {
        const body = await request.json() as { refreshToken?: string };
        refreshToken = body.refreshToken;
      } catch {
        // Body parsing failed, continue without it
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 },
      );
    }

    const lockKey = getRefreshLockKey(undefined, refreshToken);
    const session = await getRefreshLock(lockKey).getOrRefresh(
      () => performRefresh(refreshToken),
    );

    if (!session) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Token refreshed successfully' });
    response.cookies.set('accessToken', session.access_token, AUTH_COOKIE_OPTIONS);
    response.cookies.set('refreshToken', session.refresh_token, REFRESH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    logger.error('Refresh error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 500 },
    );
  }
}
