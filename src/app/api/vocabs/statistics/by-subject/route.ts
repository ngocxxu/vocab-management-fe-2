import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { statisticsApi } from '@/utils/server-api';

export async function GET(_request: NextRequest) {
  try {
    const bySubject = await statisticsApi.getBySubject();
    return NextResponse.json(bySubject);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch statistics by subject' },
      { status: 500 },
    );
  }
}
