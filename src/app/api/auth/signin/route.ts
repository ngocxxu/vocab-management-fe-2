import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/signin - User signin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Call NestJS backend for authentication
    const authResponse = await serverApi.post<{ token?: string; user: any; message: string }>('/auth/signin', {
      email,
      password,
    });

    // Create Next.js response
    const response = NextResponse.json(authResponse);

    // If the backend returns a token, set it as a cookie
    if (authResponse.token) {
      response.cookies.set('auth-token', authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signin' },
      { status: 500 },
    );
  }
}
