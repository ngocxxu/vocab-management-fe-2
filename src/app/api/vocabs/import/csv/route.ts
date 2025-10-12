import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';

// POST /api/vocabs/import/csv - Import CSV file
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const languageFolderId = searchParams.get('languageFolderId');
    const sourceLanguageCode = searchParams.get('sourceLanguageCode');
    const targetLanguageCode = searchParams.get('targetLanguageCode');

    if (!languageFolderId || !sourceLanguageCode || !targetLanguageCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: languageFolderId, sourceLanguageCode, targetLanguageCode' },
        { status: 400 },
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    // Create new FormData for the backend request
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const backendUrl = `${Env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}/vocabs/import/csv?languageFolderId=${languageFolderId}&sourceLanguageCode=${sourceLanguageCode}&targetLanguageCode=${targetLanguageCode}`;

    // Extract Bearer token from cookies
    const authCookie = cookieStore.get('accessToken') || cookieStore.get('token');
    const bearerToken = authCookie?.value;

    console.warn('🔍 CSV Import API Request:', {
      languageFolderId,
      sourceLanguageCode,
      targetLanguageCode,
      fileName: file.name,
      fileSize: file.size,
      backendUrl,
      hasToken: !!bearerToken,
    });

    // Prepare headers
    const headers: Record<string, string> = {
      Cookie: cookieStore.toString(),
    };

    // Add Bearer token if available
    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    // Forward the request to the NestJS backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend CSV import failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        { error: `Backend import failed: ${response.status} ${response.statusText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import CSV file' },
      { status: 500 },
    );
  }
}
