import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// PATCH /api/notifications/[id]/my/mark-as-read - Mark notification as read for current user
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Call NestJS backend to mark notification as read
    const result = await notificationsApi.markAsRead(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark notification as read' },
      { status: 500 },
    );
  }
}
