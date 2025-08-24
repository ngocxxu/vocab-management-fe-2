import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languageFoldersApi } from '@/utils/client-api';

// GET /api/language-folders/[id] - Get language folder by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const languageFolder = await languageFoldersApi.getById(id);
    return NextResponse.json(languageFolder);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch language folder' },
      { status: 500 },
    );
  }
}

// PUT /api/language-folders/[id] - Update language folder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedLanguageFolder = await languageFoldersApi.update(id, body);
    return NextResponse.json(updatedLanguageFolder);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update language folder' },
      { status: 500 },
    );
  }
}

// DELETE /api/language-folders/[id] - Delete language folder
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await languageFoldersApi.delete(id);

    return NextResponse.json({ message: 'Language folder deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete language folder' },
      { status: 500 },
    );
  }
}
