import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverApi } from '@/utils/server-api';

// POST /api/subjects/reorder - Reorder subjects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Call the external API directly with the reorder endpoint
    const result = await serverApi.post('/subjects/reorder', body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder subjects' },
      { status: 500 },
    );
  }
}
