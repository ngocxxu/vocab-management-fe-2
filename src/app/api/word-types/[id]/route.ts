import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { wordTypesApi } from '@/utils/api';

// GET /api/word-types/[id] - Get word type by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const wordType = await wordTypesApi.getById(id);
    return NextResponse.json(wordType);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch word type' },
      { status: 500 },
    );
  }
}

// PUT /api/word-types/[id] - Update word type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedWordType = await wordTypesApi.update(id, body);
    return NextResponse.json(updatedWordType);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update word type' },
      { status: 500 },
    );
  }
}

// DELETE /api/word-types/[id] - Delete word type
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await wordTypesApi.delete(id);
    return NextResponse.json({ message: 'Word type deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete word type' },
      { status: 500 },
    );
  }
}
