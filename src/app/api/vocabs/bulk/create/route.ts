import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/client-api';

// POST /api/vocabs/bulk/create - Create bulk vocabularies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await vocabApi.createBulk(body.data.vocabData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bulk vocabularies' },
      { status: 500 },
    );
  }
}
