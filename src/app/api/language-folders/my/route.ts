import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { languageFoldersApi } from '@/utils/client-api';

// GET /api/language-folders/my - Get current user's language folders
export async function GET(_request: NextRequest) {
  try {
    const languageFolders = await languageFoldersApi.getMy();
    return NextResponse.json(languageFolders);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user language folders' },
      { status: 500 },
    );
  }
}
