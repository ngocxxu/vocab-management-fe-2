import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabApi } from '@/utils/api';

// GET /api/vocabs/[id] - Get vocabulary by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const vocab = await vocabApi.getById(id);
    return NextResponse.json(vocab);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocabulary' },
      { status: 500 },
    );
  }
}

// PUT /api/vocabs/[id] - Update vocabulary
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await _request.json();
    const updatedVocab = await vocabApi.update(id, body);
    return NextResponse.json(updatedVocab);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vocabulary' },
      { status: 500 },
    );
  }
}

// DELETE /api/vocabs/[id] - Delete vocabulary
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await vocabApi.delete(id);
    return NextResponse.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete vocabulary' },
      { status: 500 },
    );
  }
}
