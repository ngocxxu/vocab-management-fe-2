import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const folder = searchParams.get('folder');
    const uploadPreset = searchParams.get('uploadPreset');
    const resourceType = searchParams.get('resourceType');
    const maxFileSize = searchParams.get('maxFileSize');

    const queryParams = new URLSearchParams();
    if (folder) {
      queryParams.append('folder', folder);
    }
    if (uploadPreset) {
      queryParams.append('uploadPreset', uploadPreset);
    }
    if (resourceType) {
      queryParams.append('resourceType', resourceType);
    }
    if (maxFileSize) {
      queryParams.append('maxFileSize', maxFileSize);
    }

    const queryString = queryParams.toString();
    const backendUrl = `${Env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}/cloudinary/upload-signature${queryString ? `?${queryString}` : ''}`;

    const cookieStore = await cookies();
    const authCookie = cookieStore.get('accessToken') || cookieStore.get('token');
    const bearerToken = authCookie?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieStore.toString(),
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend cloudinary signature failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        { error: `Backend signature request failed: ${response.status} ${response.statusText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get upload signature' },
      { status: 500 },
    );
  }
}
