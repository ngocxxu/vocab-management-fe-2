// Notification types based on backend Prisma schema
export type NotificationType = 'VOCAB' | 'VOCAB_TRAINER' | 'VOCAB_SUBJECT' | 'SYSTEM';

export type NotificationAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'MULTI_CREATE' | 'MULTI_DELETE' | 'REMIND';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TNotification = {
  id: string;
  type: NotificationType;
  action: NotificationAction;
  priority: PriorityLevel;
  data: Record<string, any>; // JSON data from backend
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
  action: NotificationAction;
  priority: PriorityLevel;
  data: Record<string, any>;
  isActive: boolean;
  expiresAt: string; // ISO date string
  recipientUserIds: string[];
};

export type TUpdateNotificationStatusInput = {
  isRead?: boolean;
  isDeleted?: boolean;
};
