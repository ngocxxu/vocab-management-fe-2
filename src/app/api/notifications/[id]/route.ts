import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { notificationsApi } from '@/utils/server-api';

// GET /api/notifications/[id] - Get notification by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Call NestJS backend to get notification
    const notification = await notificationsApi.getById(id);
    return NextResponse.json(notification);
  } catch (error) {
    const status = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notification';

    return NextResponse.json(
      { error: errorMessage },
      { status },
    );
  }
}

// PUT /api/notifications/[id] - Update notification (Admin/Staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Call NestJS backend to update notification
    const result = await notificationsApi.update(id, body);
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notification';

    return NextResponse.json(
      { error: errorMessage },
      { status },
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification (Admin/Staff only)
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
