'use server';

import type { TNotificationInput, TUpdateNotificationStatusInput } from '@/types/notification';
import { revalidatePath } from 'next/cache';
import { notificationsApi } from '@/utils/server-api';

export async function markNotificationAsRead(id: string) {
  try {
    const result = await notificationsApi.markAsRead(id);
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as read');
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const result = await notificationsApi.markAllAsRead();
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
  }
}

export async function deleteNotification(id: string) {
  try {
    const result = await notificationsApi.delete(id);
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete notification');
  }
}

export async function createNotification(notificationData: TNotificationInput) {
  try {
    const result = await notificationsApi.create(notificationData);
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create notification');
  }
}

export async function updateNotification(id: string, notificationData: Partial<TNotificationInput>) {
  try {
    const result = await notificationsApi.update(id, notificationData);
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update notification');
  }
}

export async function updateNotificationStatus(id: string, statusData: TUpdateNotificationStatusInput) {
  try {
    const result = await notificationsApi.updateStatus(id, statusData);
    revalidatePath('/(app)');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update notification status');
  }
}
