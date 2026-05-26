import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, performRefresh } from '@/libs/refresh-lock';
import { createBackendErrorResponse, createValidatedAuthSessionResponse } from '../session-response';

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
      return createBackendErrorResponse(
        { error: 'Refresh failed' },
        401,
        'Unauthorized',
        'Refresh failed',
      );
    }

    return createValidatedAuthSessionResponse(session, 200);
  } catch (error) {
    logger.error('Refresh error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 500 },
    );
  }
}
