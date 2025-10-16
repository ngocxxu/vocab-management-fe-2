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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notification' },
      { status: 500 },
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notification' },
      { status: 500 },
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete notification' },
      { status: 500 },
    );
  }
}
