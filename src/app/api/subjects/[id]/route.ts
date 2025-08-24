import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { subjectsApi } from '@/utils/client-api';

// GET /api/subjects/[id] - Get subject by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const subject = await subjectsApi.getById(id);
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subject' },
      { status: 500 },
    );
  }
}

// PUT /api/subjects/[id] - Update subject
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedSubject = await subjectsApi.update(id, body);
    return NextResponse.json(updatedSubject);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subject' },
      { status: 500 },
    );
  }
}

// DELETE /api/subjects/[id] - Delete subject
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await subjectsApi.delete(id);
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete subject' },
      { status: 500 },
    );
  }
}
