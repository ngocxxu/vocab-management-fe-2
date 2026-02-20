import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { serverApi } from '@/utils/server-api';

export async function POST() {
  try {
    await serverApi.post<{ message: string }>(API_ENDPOINTS.auth.signout, {});
  } catch (error) {
    const status = error && typeof error === 'object' && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 0;
    if (status !== 401 && status !== 403) {
      logger.error('Signout error:', { error });
    }
  }

  const response = NextResponse.json({ message: 'Successfully signed out' });
  const clearOpts = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
    httpOnly: true,
    ...(process.env.NODE_ENV === 'production' && { secure: true }),
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
  };
  response.cookies.set('accessToken', '', clearOpts);
  response.cookies.set('refreshToken', '', clearOpts);

  return response;
}
