import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languagesApi } from '@/utils/api';

// GET /api/languages - Get all languages
export async function GET(_request: NextRequest) {
  try {
    const languages = await languagesApi.getAll();
    return NextResponse.json(languages);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch languages' },
      { status: 500 },
    );
  }
}

// POST /api/languages - Create new language
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLanguage = await languagesApi.create(body);
    return NextResponse.json(newLanguage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create language' },
      { status: 500 },
    );
  }
}
