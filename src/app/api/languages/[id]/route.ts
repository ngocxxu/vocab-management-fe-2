import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languagesApi } from '@/utils/api';

// GET /api/languages/[id] - Get language by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const language = await languagesApi.getById(id);
    return NextResponse.json(language);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch language' },
      { status: 500 },
    );
  }
}

// PUT /api/languages/[id] - Update language
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedLanguage = await languagesApi.update(id, body);
    return NextResponse.json(updatedLanguage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update language' },
      { status: 500 },
    );
  }
}

// DELETE /api/languages/[id] - Delete language
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await languagesApi.delete(id);
    return NextResponse.json({ message: 'Language deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete language' },
      { status: 500 },
    );
  }
}
