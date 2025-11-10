import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabTrainerApi } from '@/utils/server-api';

// POST /api/vocab-trainers/bulk/delete - Delete bulk vocab trainers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await vocabTrainerApi.deleteBulk(body.ids);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete bulk vocab trainers' },
      { status: 500 },
    );
  }
}
