import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languageFoldersApi } from '@/utils/server-api';

// GET /api/language-folders/my - Get current user's language folders
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    // Build query params object
    const queryParams = {
      ...(page && { page: Number(page) }),
      ...(pageSize && { pageSize: Number(pageSize) }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    };

    const languageFolders = await languageFoldersApi.getMy(Object.keys(queryParams).length > 0 ? queryParams : undefined);

    return NextResponse.json(languageFolders);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user language folders' },
      { status: 500 },
    );
  }
}
