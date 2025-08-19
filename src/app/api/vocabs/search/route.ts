import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/api';

// GET /api/vocabs/search - Search vocabularies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 },
      );
    }

    const searchResults = await vocabApi.search(query);
    return NextResponse.json(searchResults);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search vocabularies' },
      { status: 500 },
    );
  }
}
