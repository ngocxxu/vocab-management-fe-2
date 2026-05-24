import type { NextRequest } from 'next/server';
import type { TOAuthResponse } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, getBackendAuthUrl, parseBackendResponse } from '../session-response';

type TOAuthRequestBody = {
  provider?: string;
  redirectTo?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TOAuthRequestBody;
    const { provider, redirectTo } = body;

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.oauth), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, redirectTo }),
    });

    const data = await parseBackendResponse<TOAuthResponse>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'OAuth initiation failed');
    }

    return NextResponse.json(data, { status: nestResponse.status });
  } catch (error) {
    logger.error('OAuth initiation error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate OAuth sign in' },
      { status: 500 },
    );
  }
}
