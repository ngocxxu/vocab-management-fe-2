import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// GET /api/notifications/my - Get current user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Call NestJS backend for user notifications
    const notifications = await notificationsApi.getMy(includeDeleted);
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}
