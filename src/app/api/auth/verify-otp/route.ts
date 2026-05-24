import type { NextRequest } from 'next/server';
import type { TSessionDto } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, createValidatedAuthSessionResponse, getBackendAuthUrl, parseBackendResponse } from '../session-response';

type TVerifyOtpRequestBody = {
  email?: string;
  token?: string;
  type?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TVerifyOtpRequestBody;
    const { email, token, type } = body;

    if (!email || !token || !type) {
      return NextResponse.json(
        { error: 'Email, token, and type are required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.verifyOtp), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token, type }),
    });

    const data = await parseBackendResponse<TSessionDto>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'OTP verification failed');
    }

    return createValidatedAuthSessionResponse(data, nestResponse.status);
  } catch (error) {
    logger.error('OTP verification error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 },
    );
  }
}
