import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/auth/reset-password - Reset password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Call NestJS backend to reset password
    const resetResponse = await serverApi.post<{ message: string }>('/auth/reset-password', {
      email,
    });

    return NextResponse.json(resetResponse);
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 500 },
    );
  }
}
