import type { NextRequest } from 'next/server';
import type { TSignUpResponse } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import type { TBackendErrorResponse } from '../session-response';
import { createBackendErrorResponse, getBackendAuthUrl, parseBackendResponse, parseSignUpResponse } from '../session-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, avatar, role } = body;

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.signup), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName, phone, avatar, role }),
    });

    const data = await parseBackendResponse<TSignUpResponse>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data as TBackendErrorResponse, nestResponse.status, nestResponse.statusText, 'Signup failed');
    }

    return parseSignUpResponse(data as TSignUpResponse, nestResponse.status);
  } catch (error) {
    logger.error('Signup error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signup' },
      { status: 500 },
    );
  }
}
