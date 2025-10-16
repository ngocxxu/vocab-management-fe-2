import type { TNotification, TNotificationInput, TUpdateNotificationStatusInput } from '@/types/notification';
import useSWR from 'swr';
import { notificationsApi } from '@/utils/client-api';

// Hook for getting notifications for current user
export const useNotifications = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'notifications',
    () => notificationsApi.getMy(),
  );

  return {
    notifications: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting unread notifications
export const useUnreadNotifications = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'unread-notifications',
    () => notificationsApi.getUnread(),
  );

  return {
    unreadNotifications: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting unread notification count
export const useUnreadCount = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'unread-count',
    () => notificationsApi.getUnreadCount(),
  );

  return {
    unreadCount: data?.count || 0,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single notification by ID
export const useNotification = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['notification', id] : null,
    () => notificationsApi.getById(id!),
  );

  return {
    notification: data as TNotification | undefined,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const notificationMutations = {
  // Mark notification as read
  markAsRead: async (id: string) => {
    return await notificationsApi.markAsRead(id);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await notificationsApi.markAllAsRead();
  },

  // Delete notification
  delete: async (id: string) => {
    return await notificationsApi.delete(id);
  },

  // Create notification (Admin/Staff only)
  create: async (notificationData: TNotificationInput) => {
    return await notificationsApi.create(notificationData);
  },

  // Update notification (Admin/Staff only)
  update: async (id: string, notificationData: Partial<TNotificationInput>) => {
    return await notificationsApi.update(id, notificationData);
  },

  // Update notification status for current user
  updateStatus: async (id: string, statusData: TUpdateNotificationStatusInput) => {
    return await notificationsApi.updateStatus(id, statusData);
  },
};
