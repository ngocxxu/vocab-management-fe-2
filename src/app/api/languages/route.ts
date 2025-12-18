import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languagesApi } from '@/utils/server-api';

// GET /api/languages - Get all languages
export async function GET(_request: NextRequest) {
  try {
    const languages = await languagesApi.getAll();
    return NextResponse.json(languages);
  } catch (error) {
    const status = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch languages';

    return NextResponse.json(
      { error: errorMessage },
      { status },
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
    const status = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to create language';

    return NextResponse.json(
      { error: errorMessage },
      { status },
    );
  }
}
