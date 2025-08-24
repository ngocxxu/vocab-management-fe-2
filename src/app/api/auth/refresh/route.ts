import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/refresh - Refresh authentication token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 },
      );
    }

    // Call NestJS backend to refresh token
    const refreshResponse = await serverApi.post<{ token?: string; message: string }>('/auth/refresh', {
      refreshToken,
    });

    // Create Next.js response
    const response = NextResponse.json(refreshResponse);

    // If the backend returns a new token, set it as a cookie
    if (refreshResponse.token) {
      response.cookies.set('auth-token', refreshResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh token' },
      { status: 500 },
    );
  }
}
