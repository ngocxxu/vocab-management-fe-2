import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { statisticsApi } from '@/utils/server-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: { minIncorrect?: number; limit?: number } = {};

    if (searchParams.has('minIncorrect')) {
      params.minIncorrect = Number.parseInt(searchParams.get('minIncorrect')!, 10);
    }
    if (searchParams.has('limit')) {
      params.limit = Number.parseInt(searchParams.get('limit')!, 10);
    }

    const problematic = await statisticsApi.getProblematic(Object.keys(params).length > 0 ? params : undefined);
    return NextResponse.json(problematic);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch problematic vocabs' },
      { status: 500 },
    );
  }
}
