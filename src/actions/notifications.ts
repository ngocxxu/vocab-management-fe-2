'use server';

import type { TNotificationInput, TUpdateNotificationStatusInput } from '@/types/notification';
import { notificationsApi } from '@/utils/server-api';

export async function markNotificationAsRead(id: string) {
  try {
    return await notificationsApi.markAsRead(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as read');
  }
}

export async function markAllNotificationsAsRead() {
  try {
    return await notificationsApi.markAllAsRead();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
  }
}

export async function deleteNotification(id: string) {
  try {
    return await notificationsApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete notification');
  }
}

export async function createNotification(notificationData: TNotificationInput) {
  try {
    return await notificationsApi.create(notificationData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create notification');
  }
}

export async function updateNotification(id: string, notificationData: Partial<TNotificationInput>) {
  try {
    return await notificationsApi.update(id, notificationData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update notification');
  }
}

export async function updateNotificationStatus(id: string, statusData: TUpdateNotificationStatusInput) {
  try {
    return await notificationsApi.updateStatus(id, statusData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update notification status');
  }
}
