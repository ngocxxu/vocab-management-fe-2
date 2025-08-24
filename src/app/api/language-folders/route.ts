import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languageFoldersApi } from '@/utils/client-api';

// GET /api/language-folders - Get all language folders (if needed)
export async function GET(_request: NextRequest) {
  try {
    // For now, return empty array as this endpoint might not be needed
    // The main endpoint for user folders is /api/language-folders/my
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Language folders retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch language folders' },
      { status: 500 },
    );
  }
}

// POST /api/language-folders - Create new language folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLanguageFolder = await languageFoldersApi.create(body);
    return NextResponse.json(newLanguageFolder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create language folder' },
      { status: 500 },
    );
  }
}
