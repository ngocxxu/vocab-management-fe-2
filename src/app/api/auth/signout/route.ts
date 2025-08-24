import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/signout - User signout
export async function POST() {
  try {
    // Call NestJS backend for signout
    const signoutResponse = await serverApi.post<{ message: string }>('/auth/signout', {});

    // Clear authentication cookie
    const response = NextResponse.json(signoutResponse);
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signout' },
      { status: 500 },
    );
  }
}
