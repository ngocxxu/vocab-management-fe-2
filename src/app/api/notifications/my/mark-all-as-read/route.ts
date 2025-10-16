import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// PATCH /api/notifications/my/mark-all-as-read - Mark all notifications as read for current user
export async function PATCH(_request: NextRequest) {
  try {
    // Call NestJS backend to mark all notifications as read
    const result = await notificationsApi.markAllAsRead();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' },
      { status: 500 },
    );
  }
}
