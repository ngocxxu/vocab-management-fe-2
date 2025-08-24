import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// GET /api/auth/verify - Verify authentication status
export async function GET() {
  try {
    // Call NestJS backend to verify authentication
    const verifyResponse = await serverApi.get<{ user: any; isAuthenticated: boolean }>('/auth/verify');

    return NextResponse.json(verifyResponse);
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify authentication' },
      { status: 500 },
    );
  }
}
