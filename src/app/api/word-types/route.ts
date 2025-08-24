import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { wordTypesApi } from '@/utils/client-api';

// GET /api/word-types - Get all word types
export async function GET(_request: NextRequest) {
  try {
    const wordTypes = await wordTypesApi.getAll();
    return NextResponse.json(wordTypes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch word types' },
      { status: 500 },
    );
  }
}

// POST /api/word-types - Create new word type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newWordType = await wordTypesApi.create(body);
    return NextResponse.json(newWordType, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create word type' },
      { status: 500 },
    );
  }
}
