import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/utils/api-config';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/signout - User signout
export async function POST() {
  try {
    // Call NestJS backend for signout
    const signoutResponse = await serverApi.post<{ message: string }>(API_ENDPOINTS.auth.signout, {});

    // Clear authentication cookie
    const response = NextResponse.json(signoutResponse || { message: 'Successfully signed out' });
    response.cookies.delete('auth-token');
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signout' },
      { status: 500 },
    );
  }
}
