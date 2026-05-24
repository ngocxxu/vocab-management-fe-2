import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { createBackendErrorResponse, getBackendAuthUrl, parseBackendResponse } from '../session-response';

type TResendConfirmationRequestBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TResendConfirmationRequestBody;
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.resendConfirmation), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await parseBackendResponse<{ message: string }>(nestResponse);

    if (!nestResponse.ok) {
      return createBackendErrorResponse(data, nestResponse.status, nestResponse.statusText, 'Resend confirmation failed');
    }

    return NextResponse.json(data, { status: nestResponse.status });
  } catch (error) {
    logger.error('Resend confirmation error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend confirmation' },
      { status: 500 },
    );
  }
}
