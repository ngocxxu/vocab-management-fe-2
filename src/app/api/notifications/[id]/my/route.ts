import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// DELETE /api/notifications/[id]/my - Delete notification for current user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Call NestJS backend to delete notification
    const result = await notificationsApi.delete(id);
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';

    return NextResponse.json(
      { error: errorMessage },
      { status },
    );
  }
}
