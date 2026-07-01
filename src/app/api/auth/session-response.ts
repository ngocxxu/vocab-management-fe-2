import type { TAuthResponse, TSessionDto, TSignUpResponse, TSignUpResult } from '@/types/auth';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '@/utils/auth-cookies';

export type TBackendErrorResponse = {
  error?: string;
  message?: string;
  statusCode?: number;
  [key: string]: unknown;
};

export function getBackendAuthUrl(endpoint: string): string {
  return `${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${endpoint}`;
}

export async function parseBackendResponse<T>(response: Response): Promise<T | TBackendErrorResponse> {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as T | TBackendErrorResponse;
  } catch {
    return { error: responseText };
  }
}

export function isSessionDto(data: unknown): data is TSessionDto {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const session = data as Partial<TSessionDto>;
  return (
    typeof session.access_token === 'string'
    && session.access_token.length > 0
    && typeof session.refresh_token === 'string'
    && session.refresh_token.length > 0
    && !!session.user
    && typeof session.user === 'object'
  );
}

export function createBackendErrorResponse(
  data: TBackendErrorResponse,
  status: number,
  statusText: string,
  fallbackMessage: string,
): NextResponse {
  const errorMessage = data.message ?? data.error ?? `${fallbackMessage}: ${statusText}`;

  return NextResponse.json(
    {
      ...data,
      error: errorMessage,
    },
    { status },
  );
}

export function createAuthSessionResponse(session: TSessionDto, status: number): NextResponse<TAuthResponse> {
  const response = NextResponse.json<TAuthResponse>(
    { user: session.user },
    { status },
  );

  response.cookies.set('accessToken', session.access_token, AUTH_COOKIE_OPTIONS);
  response.cookies.set('refreshToken', session.refresh_token, REFRESH_COOKIE_OPTIONS);

  return response;
}

export function createValidatedAuthSessionResponse(data: unknown, status: number): NextResponse<TAuthResponse | TBackendErrorResponse> {
  if (!isSessionDto(data)) {
    return NextResponse.json(
      { error: 'Backend returned an invalid auth session' },
      { status: 502 },
    );
  }

  return createAuthSessionResponse(data, status);
}

export function parseSignUpResponse(body: TSignUpResponse, status: number): NextResponse<TSignUpResult | TBackendErrorResponse> {
  if (!body.session) {
    return NextResponse.json<TSignUpResult>(
      { user: null, message: body.message },
      { status },
    );
  }

  if (!isSessionDto(body.session)) {
    return NextResponse.json(
      { error: 'Backend returned an invalid auth session' },
      { status: 502 },
    );
  }

  const response = NextResponse.json<TSignUpResult>(
    { user: body.session.user, message: body.message },
    { status },
  );

  response.cookies.set('accessToken', body.session.access_token, AUTH_COOKIE_OPTIONS);
  response.cookies.set('refreshToken', body.session.refresh_token, REFRESH_COOKIE_OPTIONS);

  return response;
}
