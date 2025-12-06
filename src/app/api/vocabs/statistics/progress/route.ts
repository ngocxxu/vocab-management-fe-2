import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { statisticsApi } from '@/utils/server-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: { startDate?: string; endDate?: string } = {};

    if (searchParams.has('startDate')) {
      params.startDate = searchParams.get('startDate')!;
    }
    if (searchParams.has('endDate')) {
      params.endDate = searchParams.get('endDate')!;
    }

    const progress = await statisticsApi.getProgress(Object.keys(params).length > 0 ? params : undefined);
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch progress statistics' },
      { status: 500 },
    );
  }
}
