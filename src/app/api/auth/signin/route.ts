import type { NextRequest } from 'next/server';
import type { TSessionDto } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, createValidatedAuthSessionResponse, getBackendAuthUrl, parseBackendResponse } from '../session-response';

type SigninRequestBody = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SigninRequestBody;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.signin), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseBackendResponse<TSessionDto>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'Signin failed');
    }

    return createValidatedAuthSessionResponse(data, nestResponse.status);
  } catch (error) {
    logger.error('Signin error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signin' },
      { status: 500 },
    );
  }
}
