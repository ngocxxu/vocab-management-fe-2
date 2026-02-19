import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/signout - User signout
export async function POST() {
  try {
    // Call NestJS backend for signout
    const signoutResponse = await serverApi.post<{ message: string }>(API_ENDPOINTS.auth.signout, {});

    const response = NextResponse.json(signoutResponse || { message: 'Successfully signed out' });
    const deleteOpts = {
      path: '/',
      sameSite: 'lax' as const,
      ...(process.env.NODE_ENV === 'production' && { secure: true }),
    };
    response.cookies.delete({ name: 'accessToken', ...deleteOpts });
    response.cookies.delete({ name: 'refreshToken', ...deleteOpts });

    return response;
  } catch (error) {
    logger.error('Signout error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signout' },
      { status: 500 },
    );
  }
}
