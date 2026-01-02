import type { NextRequest } from 'next/server';
import type { TAuthResponse } from '@/types/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';

type SigninRequestBody = {
  email: string;
  password: string;
};

type SigninErrorResponse = {
  error: string;
  message?: string;
  [key: string]: unknown;
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

    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.signin}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await nestResponse.text();
    let data: TAuthResponse | SigninErrorResponse;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { error: responseText || 'Unknown error' };
    }

    if (!nestResponse.ok) {
      const errorMessage = 'error' in data ? data.error : ('message' in data ? data.message : `Signin failed: ${nestResponse.statusText}`);
      return NextResponse.json(
        {
          error: errorMessage,
          ...data,
        },
        { status: nestResponse.status },
      );
    }

    const response = NextResponse.json(data, { status: nestResponse.status });

    // forward Set-Cookie from NestJS
    const setCookie = nestResponse.headers.get('set-cookie');
    if (setCookie) {
      response.headers.append('Set-Cookie', setCookie);
    }

    return response;
  } catch (error) {
    logger.error('Signin error:', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signin' },
      { status: 500 },
    );
  }
}
