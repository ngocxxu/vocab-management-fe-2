import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { subjectsApi } from '@/utils/server-api';

// GET /api/subjects - Get all subjects
export async function GET(_request: NextRequest) {
  try {
    const subjects = await subjectsApi.getAll();
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subjects' },
      { status: 500 },
    );
  }
}

// POST /api/subjects - Create new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newSubject = await subjectsApi.create(body);
    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subject' },
      { status: 500 },
    );
  }
}
