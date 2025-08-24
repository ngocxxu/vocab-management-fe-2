import type { NextRequest } from 'next/server';
import type { VocabQueryParams } from '@/utils/api-config';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/server-api';

// GET /api/vocabs - Get all vocabularies with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract all query parameters
    const queryParams: VocabQueryParams = {};

    // Pagination
    if (searchParams.has('page')) {
      queryParams.page = Number.parseInt(searchParams.get('page')!, 10);
    }
    if (searchParams.has('pageSize')) {
      queryParams.pageSize = Number.parseInt(searchParams.get('pageSize')!, 10);
    }

    // Sorting
    if (searchParams.has('sortBy')) {
      queryParams.sortBy = searchParams.get('sortBy')!;
    }
    if (searchParams.has('sortOrder')) {
      queryParams.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    }

    // Filtering
    if (searchParams.has('textSource')) {
      queryParams.textSource = searchParams.get('textSource')!;
    }
    if (searchParams.has('sourceLanguageCode')) {
      queryParams.sourceLanguageCode = searchParams.get('sourceLanguageCode')!;
    }
    if (searchParams.has('targetLanguageCode')) {
      queryParams.targetLanguageCode = searchParams.get('targetLanguageCode')!;
    }
    if (searchParams.has('subjectIds')) {
      queryParams.subjectIds = searchParams.get('subjectIds')!.split(',');
    }
    if (searchParams.has('userId')) {
      queryParams.userId = searchParams.get('userId')!;
    }

    // Call NestJS backend for vocabularies
    const vocabs = await vocabApi.getAll(queryParams);
    return NextResponse.json(vocabs);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocabularies' },
      { status: 500 },
    );
  }
}

// POST /api/vocabs - Create new vocabulary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call NestJS backend to create vocabulary
    const newVocab = await vocabApi.create(body);
    return NextResponse.json(newVocab, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vocabulary' },
      { status: 500 },
    );
  }
}
