import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { statisticsApi } from '@/utils/server-api';

export async function GET(_request: NextRequest) {
  try {
    const summary = await statisticsApi.getSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch statistics summary' },
      { status: 500 },
    );
  }
}
