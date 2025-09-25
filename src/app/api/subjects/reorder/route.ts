import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { subjectsApi } from '@/utils/server-api';

// PATCH /api/subjects/reorder - Reorder subjects
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    // Call the external API directly with the reorder endpoint
    const result = await subjectsApi.reorder(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder subjects' },
      { status: 500 },
    );
  }
}
