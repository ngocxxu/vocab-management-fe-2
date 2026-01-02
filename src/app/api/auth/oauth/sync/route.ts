import type { NextRequest } from 'next/server';
import type { TOAuthSyncResponse } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';

type OAuthSyncRequestBody = {
  accessToken: string;
  refreshToken?: string;
};

type OAuthSyncErrorResponse = {
  error: string;
  message?: string;
  [key: string]: unknown;
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

    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.oauthSync}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Server/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
      credentials: 'include',
    });

    const responseText = await nestResponse.text();
    let data: TOAuthSyncResponse | OAuthSyncErrorResponse;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { error: responseText || 'Unknown error' };
    }

    if (!nestResponse.ok) {
      const errorMessage = 'error' in data ? data.error : ('message' in data ? data.message : `OAuth sync failed: ${nestResponse.statusText}`);
      return NextResponse.json(
        {
          error: errorMessage,
          ...data,
        },
        { status: nestResponse.status },
      );
    }

    const response = NextResponse.json(data, { status: nestResponse.status });

    const setCookieHeaders = nestResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    logger.error('OAuth sync error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync OAuth user' },
      { status: 500 },
    );
  }
}
