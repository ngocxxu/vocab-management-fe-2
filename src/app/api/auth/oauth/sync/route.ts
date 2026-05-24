import type { NextRequest } from 'next/server';
import type { TSessionDto } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, createValidatedAuthSessionResponse, getBackendAuthUrl, parseBackendResponse } from '../../session-response';

type OAuthSyncRequestBody = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OAuthSyncRequestBody;
    const { accessToken, refreshToken } = body;

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 },
      );
    }

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.oauthSync), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
      credentials: 'include',
    });

    const data = await parseBackendResponse<TSessionDto>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'OAuth sync failed');
    }

    return createValidatedAuthSessionResponse(data, nestResponse.status);
  } catch (error) {
    logger.error('OAuth sync error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync OAuth user' },
      { status: 500 },
    );
  }
}
