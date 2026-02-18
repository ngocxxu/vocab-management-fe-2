import type React from 'react';
import type { TNotificationData } from './notification-data';

// Notification types based on backend Prisma schema
export enum ENotificationType {
  VOCAB = 'VOCAB',
  VOCAB_TRAINER = 'VOCAB_TRAINER',
  VOCAB_SUBJECT = 'VOCAB_SUBJECT',
  SYSTEM = 'SYSTEM',
}

export type NotificationType = ENotificationType;

export enum ENotificationAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MULTI_CREATE = 'MULTI_CREATE',
  MULTI_DELETE = 'MULTI_DELETE',
  REMIND = 'REMIND',
}

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TNotification = {
  id: string;
  type: NotificationType;
  action: ENotificationAction;
  priority: PriorityLevel;
  data: TNotificationData;
  isActive: boolean;
  expiresAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  recipients?: TNotificationRecipient[];
};

export type TNotificationRecipient = {
  id: string;
  notificationId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// Response types for API calls
export type TNotificationResponse = {
  items: TNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TUnreadCountResponse = {
  count: number;
};

export type TMarkAsReadResponse = TNotification;

export type TMarkAllAsReadResponse = {
  count: number;
};

export type TDeleteNotificationResponse = TNotification;

// Input types for creating/updating notifications
export type TNotificationInput = {
  type: NotificationType;
  action: ENotificationAction;
  priority: PriorityLevel;
  data: TNotificationData;
  isActive: boolean;
  expiresAt: string; // ISO date string
  recipientUserIds: string[];
};

export type TUpdateNotificationStatusInput = {
  isRead?: boolean;
  isDeleted?: boolean;
};

export type NotificationDropdownData = {
  items: TNotification[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type NotificationDropdownProps = {
  className?: string;
  allNotifications?: NotificationDropdownData | null;
  unreadNotifications?: NotificationDropdownData | null;
  unreadCount?: TUnreadCountResponse | null;
  isLoading?: boolean;
  error?: string | null;
};

export type NotificationWithReadStatus = TNotification & {
  isRead: boolean;
};

export type NotificationWithRead = {
  notification: TNotification;
  isRead: boolean;
};

export type NotificationItemProps = {
  itemIndex: number;
  notification: TNotification;
  isRead: boolean;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  variant?: 'dropdown' | 'page';
};

export type NotificationListProps = {
  notifications: NotificationWithReadStatus[];
  isLoading: boolean;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

export type NotificationTabContentProps = {
  notifications: NotificationWithReadStatus[];
  isLoading: boolean;
  displayedCount: number;
  totalCount: number;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

export type NotificationsPageContentProps = Readonly<{
  notificationsWithRead: NotificationWithRead[];
}>;
