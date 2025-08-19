import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/api';

// GET /api/vocabs - Get all vocabularies
export async function GET(_request: NextRequest) {
  try {
    const vocabs = await vocabApi.getAll();
    return NextResponse.json(vocabs);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocabularies' },
      { status: 500 },
    );
  }
}

// POST /api/vocabs - Create new vocabulary
export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json();
    const newVocab = await vocabApi.create(body);
    return NextResponse.json(newVocab, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vocabulary' },
      { status: 500 },
    );
  }
}
