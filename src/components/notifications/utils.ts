import type { NotificationType, TNotification } from '@/types/notification';
import {
  Book,
  CheckCircle,
  DangerCircle,
  FolderOpen,
  InfoCircle,
  Settings,
  SquareAcademicCap,
} from '@solar-icons/react/ssr';
import { CircleFill } from '@/components/ui/circle-fill';

/**
 * Format notification message based on type, action, and data
 */
export const formatNotificationMessage = (notification: TNotification): string => {
  const { type, action, data } = notification;

  // Get the relevant data fields
  const vocabName = data?.vocabName || data?.name || 'item';
  const trainerName = data?.trainerName || data?.name || 'trainer';

  switch (type) {
    case 'VOCAB':
      switch (action as string) {
        case 'CREATE':
          return `New vocabulary "${vocabName}" has been added`;
        case 'UPDATE':
          return `Vocabulary "${vocabName}" has been updated`;
        case 'DELETE':
          return `Vocabulary "${vocabName}" has been deleted`;
        case 'MULTI_CREATE':
          return `${data?.count || 'Multiple'} vocabularies have been added`;
        case 'MULTI_DELETE':
          return `${data?.count || 'Multiple'} vocabularies have been deleted`;
        case 'REMIND':
          return `Reminder: Review vocabulary "${vocabName}"`;
        default:
          return `Vocabulary "${vocabName}" ${action.toLowerCase()}`;
      }

    case 'VOCAB_TRAINER':
      switch (action) {
        case 'CREATE':
          return `New trainer "${trainerName}" has been created`;
        case 'UPDATE':
          return `Trainer "${trainerName}" has been updated`;
        case 'DELETE':
          return `Trainer "${trainerName}" has been deleted`;
        case 'REMIND':
          return `Reminder: Complete trainer "${trainerName}"`;
        default:
          return `Trainer "${trainerName}" ${action.toLowerCase()}`;
      }

    case 'VOCAB_SUBJECT':
      switch (action) {
        case 'CREATE':
          return `New subject "${data?.subjectName || 'subject'}" has been added`;
        case 'UPDATE':
          return `Subject "${data?.subjectName || 'subject'}" has been updated`;
        case 'DELETE':
          return `Subject "${data?.subjectName || 'subject'}" has been deleted`;
        default:
          return `Subject ${action.toLowerCase()}`;
      }

    case 'SYSTEM':
      switch (action) {
        case 'CREATE':
          return data?.message || 'New system notification';
        case 'UPDATE':
          return data?.message || 'System notification updated';
        case 'REMIND':
          return data?.message || 'System reminder';
        default:
          return data?.message || 'System notification';
      }

    default:
      return `${type} ${action.toLowerCase()}`;
  }
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'VOCAB':
      return Book;
    case 'VOCAB_TRAINER':
      return SquareAcademicCap;
    case 'VOCAB_SUBJECT':
      return FolderOpen;
    case 'SYSTEM':
      return Settings;
    default:
      return InfoCircle;
  }
};

/**
 * Get notification icon color based on priority
 */
export const getNotificationIconColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'text-red-500';
    case 'MEDIUM':
      return 'text-yellow-500';
    case 'LOW':
      return 'text-blue-500';
    default:
      return 'text-slate-500';
  }
};

/**
 * Format relative time (time ago)
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

/**
 * Check if notification is expired
 */
export const isNotificationExpired = (notification: TNotification): boolean => {
  if (!notification.expiresAt) {
    return false;
  }
  return new Date(notification.expiresAt) < new Date();
};

/**
 * Get notification status icon
 */
export const getNotificationStatusIcon = (isRead: boolean, priority: string) => {
  if (isRead) {
    return CheckCircle;
  }

  switch (priority) {
    case 'HIGH':
      return DangerCircle;
    case 'MEDIUM':
      return CircleFill;
    default:
      return CircleFill;
  }
};

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export type NotificationDateGroup = {
  today: TNotification[];
  yesterday: TNotification[];
  lastWeek: TNotification[];
};

export function groupNotificationsByDate(notifications: TNotification[]): NotificationDateGroup {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekAgo = new Date(todayStart);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const today: TNotification[] = [];
  const yesterday: TNotification[] = [];
  const lastWeek: TNotification[] = [];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const dayStart = startOfDay(d);
    if (dayStart.getTime() === todayStart.getTime()) {
      today.push(n);
    } else if (dayStart.getTime() === yesterdayStart.getTime()) {
      yesterday.push(n);
    } else if (d.getTime() >= weekAgo.getTime()) {
      lastWeek.push(n);
    } else {
      lastWeek.push(n);
    }
  }

  return { today, yesterday, lastWeek };
}

export function formatNotificationListDate(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const dayStart = startOfDay(date);

  if (dayStart.getTime() === todayStart.getTime()) {
    return formatTimeAgo(dateString);
  }
  if (dayStart.getTime() === yesterdayStart.getTime()) {
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `Yesterday, ${time}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getNotificationIconBg(type: NotificationType): string {
  switch (type) {
    case 'VOCAB':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'VOCAB_TRAINER':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'VOCAB_SUBJECT':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'SYSTEM':
      return 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
}
