import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { statisticsApi } from '@/utils/server-api';

export async function GET(_request: NextRequest) {
  try {
    const distribution = await statisticsApi.getDistribution();
    return NextResponse.json(distribution);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch distribution statistics' },
      { status: 500 },
    );
  }
}
