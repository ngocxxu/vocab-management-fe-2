import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/utils/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 },
      );
    }

    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.oauthSync}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
      credentials: 'include',
    });

    const responseText = await nestResponse.text();
    let data: any;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { error: responseText || 'Unknown error' };
    }

    if (!nestResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || data.message || `OAuth sync failed: ${nestResponse.statusText}`,
          ...data,
        },
        { status: nestResponse.status },
      );
    }

    const response = NextResponse.json(data, { status: nestResponse.status });

    const setCookieHeaders = nestResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync OAuth user' },
      { status: 500 },
    );
  }
}
