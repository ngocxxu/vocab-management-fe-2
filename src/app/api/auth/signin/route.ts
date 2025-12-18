import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/utils/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.signin}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await nestResponse.text();
    let data: any;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      // If parsing fails, use the text as error message
      data = { error: responseText || 'Unknown error' };
    }

    // If NestJS returned an error status, forward it with proper error message
    if (!nestResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || data.message || `Signin failed: ${nestResponse.statusText}`,
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
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signin' },
      { status: 500 },
    );
  }
}
