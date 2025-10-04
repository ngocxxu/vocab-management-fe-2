import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/utils/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, avatar, role } = body;

    const nestResponse = await fetch(`${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${API_ENDPOINTS.auth.signup}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName, phone, avatar, role }),
    });

    const data = await nestResponse.json();

    const response = NextResponse.json(data, { status: nestResponse.status });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to signup' },
      { status: 500 },
    );
  }
}
