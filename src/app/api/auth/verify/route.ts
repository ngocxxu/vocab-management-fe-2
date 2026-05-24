import type { TUser } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { serverApi } from '@/utils/server-api';

export async function GET() {
  try {
    const verifyResponse = await serverApi.get<TUser>('/auth/verify');
    return NextResponse.json(verifyResponse);
  } catch (error) {
    logger.error('Verify error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify authentication' },
      { status: 500 },
    );
  }
}
