import type { NextRequest } from 'next/server';
import type { TSessionDto } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '@/utils/auth-cookies';
import { API_ENDPOINTS } from '@/utils/api-config';

// POST /api/auth/refresh - Refresh authentication token
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies OR body
    let refreshToken = request.cookies.get('refreshToken')?.value;

    // If not in cookies, try to get from body (for server-side calls)
    if (!refreshToken) {
      try {
        const body = await request.json();
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

    // Call NestJS backend to refresh token (send refreshToken in body, not as cookie)
    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await nestResponse.json() as TSessionDto;

    if (!nestResponse.ok) {
      return NextResponse.json(data, { status: nestResponse.status });
    }

    // Strip tokens and set HttpOnly cookies on the response object
    const { access_token, refresh_token, expires_in, expires_at, token_type, ...responseData } = data;
    const response = NextResponse.json(responseData, { status: nestResponse.status });

    if (access_token && refresh_token) {
      response.cookies.set('accessToken', access_token, AUTH_COOKIE_OPTIONS);
      response.cookies.set('refreshToken', refresh_token, REFRESH_COOKIE_OPTIONS);
    }

    return response;
  } catch (error) {
    logger.error('Refresh error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 500 },
    );
  }
}
