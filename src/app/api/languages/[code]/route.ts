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
