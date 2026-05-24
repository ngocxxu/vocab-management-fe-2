import type { NextRequest } from 'next/server';
import type { TSessionDto } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, createValidatedAuthSessionResponse, getBackendAuthUrl, parseBackendResponse } from '../session-response';

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
    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.refresh), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await parseBackendResponse<TSessionDto>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'Refresh failed');
    }

    return createValidatedAuthSessionResponse(data, nestResponse.status);
  } catch (error) {
    logger.error('Refresh error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 500 },
    );
  }
}
