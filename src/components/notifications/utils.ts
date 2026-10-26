import type { EQuestionType } from '@/enum/vocab-trainer';
import type { NotificationType, TNotification } from '@/types/notification';
import type { TNotificationData } from '@/types/notification-data';
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
import { ENotificationReminderKind } from '@/types/notification';
import { startOfDay } from '@/utils/date';

type TReminderTarget
  = | { trainerId: string; isFsrs: true }
    | { trainerId: string; isFsrs: false; questionType: EQuestionType };

/** Where a Reminder's Start button leads. Null when the data lacks what that route needs. */
export function getReminderTarget(data: TNotificationData | undefined): TReminderTarget | null {
  const trainerId = typeof data?.trainerId === 'string' ? data.trainerId : undefined;
  if (!trainerId) {
    return null;
  }

  if (data?.kind === ENotificationReminderKind.FSRS_DUE) {
    return { trainerId, isFsrs: true };
  }

  const questionType = typeof data?.questionType === 'string' ? data.questionType as EQuestionType : undefined;
  return questionType ? { trainerId, isFsrs: false, questionType } : null;
}

/** Translator for the `notifications` namespace. Kept as a plain type so these helpers stay hook-free. */
export type TNotificationTranslator = (key: string, values?: Record<string, string | number>) => string;

/**
 * Format notification message based on type, action, and data.
 * `data.message` (SYSTEM notifications) comes from the backend and is shown as sent.
 */
export const formatNotificationMessage = (notification: TNotification, t: TNotificationTranslator): string => {
  const { type, action, data } = notification;

  // Get the relevant data fields
  const vocabName = String(data?.vocabName || data?.name || t('fallback.item'));
  const trainerName = String(data?.trainerName || data?.name || t('fallback.trainer'));

  switch (type) {
    case 'VOCAB':
      switch (action as string) {
        case 'CREATE':
          return t('message.vocabCreate', { name: vocabName });
        case 'UPDATE':
          return t('message.vocabUpdate', { name: vocabName });
        case 'DELETE':
          return t('message.vocabDelete', { name: vocabName });
        case 'MULTI_CREATE':
          return t('message.vocabMultiCreate', { count: String(data?.count || t('multiple')) });
        case 'MULTI_DELETE':
          return t('message.vocabMultiDelete', { count: String(data?.count || t('multiple')) });
        case 'REMIND':
          return t('message.vocabRemind', { name: vocabName });
        default:
          return t('message.vocabFallback', { name: vocabName, action: action.toLowerCase() });
      }

    case 'VOCAB_TRAINER':
      switch (action) {
        case 'CREATE':
          return t('message.trainerComplete', { name: trainerName });
        case 'UPDATE':
          return t('message.trainerUpdate', { name: trainerName });
        case 'DELETE':
          return t('message.trainerDelete', { name: trainerName });
        case 'REMIND':
          return t('message.trainerRemind', { name: trainerName });
        default:
          return t('message.trainerFallback', { name: trainerName, action: action.toLowerCase() });
      }

    case 'VOCAB_SUBJECT': {
      const subjectName = String(data?.subjectName || t('fallback.subject'));
      switch (action) {
        case 'CREATE':
          return t('message.subjectCreate', { name: subjectName });
        case 'UPDATE':
          return t('message.subjectUpdate', { name: subjectName });
        case 'DELETE':
          return t('message.subjectDelete', { name: subjectName });
        default:
          return t('message.subjectFallback', { action: action.toLowerCase() });
      }
    }

    case 'SYSTEM':
      switch (action) {
        case 'CREATE':
          return data?.message || t('message.systemCreate');
        case 'UPDATE':
          return data?.message || t('message.systemUpdate');
        case 'REMIND':
          return data?.message || t('message.systemRemind');
        default:
          return data?.message || t('message.systemDefault');
      }

    default:
      return t('message.typeFallback', { type, action: action.toLowerCase() });
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
      return 'text-destructive';
    case 'MEDIUM':
      return 'text-warning';
    case 'LOW':
      return 'text-primary';
    default:
      return 'text-muted-foreground';
  }
};

/**
 * Format relative time (time ago)
 */
export const formatTimeAgo = (dateString: string, t: TNotificationTranslator): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t('time.justNow');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t('time.minutes', { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t('time.hours', { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return t('time.days', { count: diffInDays });
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return t('time.weeks', { count: diffInWeeks });
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return t('time.months', { count: diffInMonths });
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return t('time.years', { count: diffInYears });
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

export function formatNotificationListDate(dateString: string, t: TNotificationTranslator, locale: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const dayStart = startOfDay(date);

  if (dayStart.getTime() === todayStart.getTime()) {
    return formatTimeAgo(dateString, t);
  }
  if (dayStart.getTime() === yesterdayStart.getTime()) {
    const time = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: locale.startsWith('en') });
    return t('time.yesterdayAt', { time });
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getNotificationIconBg(type: NotificationType): string {
  switch (type) {
    case 'VOCAB':
      return 'bg-success/15 text-success';
    case 'VOCAB_TRAINER':
      return 'bg-primary/15 text-primary';
    case 'VOCAB_SUBJECT':
      return 'bg-warning/20 text-warning';
    case 'SYSTEM':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
