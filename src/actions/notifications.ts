'use server';

import type { TNotificationInput, TUpdateNotificationStatusInput } from '@/types/notification';
import { revalidatePath } from 'next/cache';
import { notificationsApi } from '@/utils/server-api';
import { toActionError } from './utils';

export async function markNotificationAsRead(id: string) {
  try {
    const result = await notificationsApi.markAsRead(id);
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'markNotificationAsRead');
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const result = await notificationsApi.markAllAsRead();
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'markAllNotificationsAsRead');
  }
}

export async function deleteNotification(id: string) {
  try {
    const result = await notificationsApi.delete(id);
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'deleteNotification');
  }
}

export async function createNotification(notificationData: TNotificationInput) {
  try {
    const result = await notificationsApi.create(notificationData);
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'createNotification');
  }
}

export async function updateNotification(id: string, notificationData: Partial<TNotificationInput>) {
  try {
    const result = await notificationsApi.update(id, notificationData);
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'updateNotification');
  }
}

export async function updateNotificationStatus(id: string, statusData: TUpdateNotificationStatusInput) {
  try {
    const result = await notificationsApi.updateStatus(id, statusData);
    revalidatePath('/notifications');
    return result;
  } catch (error) {
    throw await toActionError(error, 'updateNotificationStatus');
  }
}
