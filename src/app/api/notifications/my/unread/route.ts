import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// GET /api/notifications/my/unread - Get unread notifications for current user
export async function GET(_request: NextRequest) {
  try {
    // Call NestJS backend for unread notifications
    const notifications = await notificationsApi.getUnread();
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unread notifications' },
      { status: 500 },
    );
  }
}
