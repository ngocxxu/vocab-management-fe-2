import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabTrainerApi } from '@/utils/api';

// PATCH /api/vocab-trainers/[id]/exam - Submit exam results
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const examResults = await vocabTrainerApi.submitExam(id, body);
    return NextResponse.json(examResults);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit exam results' },
      { status: 500 },
    );
  }
}
