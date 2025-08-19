import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabTrainerApi } from '@/utils/api';

// GET /api/vocab-trainers/[id] - Get vocab trainer by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const trainer = await vocabTrainerApi.getById(id);
    return NextResponse.json(trainer);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocab trainer' },
      { status: 500 },
    );
  }
}

// DELETE /api/vocab-trainers/[id] - Delete vocab trainer
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await vocabTrainerApi.delete(id);
    return NextResponse.json({ message: 'Vocab trainer deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete vocab trainer' },
      { status: 500 },
    );
  }
}
