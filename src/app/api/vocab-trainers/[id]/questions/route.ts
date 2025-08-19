import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabTrainerApi } from '@/utils/api';

// GET /api/vocab-trainers/[id]/exam - Get exam for a trainer
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const exam = await vocabTrainerApi.getExam(id);
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch exam' },
      { status: 500 },
    );
  }
}
