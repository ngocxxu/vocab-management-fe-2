import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// GET /api/notifications/my/unread-count - Get unread notification count for current user
export async function GET(_request: NextRequest) {
  try {
    // Call NestJS backend for unread count
    const count = await notificationsApi.getUnreadCount();
    return NextResponse.json(count);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unread count' },
      { status: 500 },
    );
  }
}
