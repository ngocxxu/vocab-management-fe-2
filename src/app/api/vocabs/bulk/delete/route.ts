import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/api';

// POST /api/vocabs/bulk/delete - Delete bulk vocabularies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await vocabApi.deleteBulk(body.data.ids);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete bulk vocabularies' },
      { status: 500 },
    );
  }
}
