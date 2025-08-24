import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/signup - User signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, avatar, role } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 },
      );
    }

    // Call NestJS backend for user creation
    const authResponse = await serverApi.post<{ token?: string; user: any; message: string }>('/auth/signup', {
      email,
      password,
      firstName,
      lastName,
      phone,
      avatar,
      role,
    });

    // Set authentication cookie from backend response
    const response = NextResponse.json(authResponse, { status: 201 });

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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signup' },
      { status: 500 },
    );
  }
}
