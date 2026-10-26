'use client';

import type { NotificationItemProps } from '@/types/notification';
import { RefreshCircle } from '@solar-icons/react/ssr';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { getExam } from '@/actions';
import { markNotificationAsRead } from '@/actions/notifications';
import { getExamUrl, getReviewUrl } from '@/constants/vocab-trainer';
import { logger } from '@/libs/Logger';
import { cn } from '@/libs/utils';
import { ENotificationAction, ENotificationReminderKind, ENotificationType } from '@/types/notification';
import {
  formatNotificationListDate,
  formatNotificationMessage,
  formatTimeAgo,
  getNotificationIcon,
  getNotificationIconBg,
  getReminderTarget,
} from './utils';

export const NotificationItem: React.FC<NotificationItemProps> = ({
  itemIndex,
  notification,
  isRead,
  onMarkAsRead,
  variant = 'dropdown',
  onDelete: _onDelete,
}) => {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const router = useRouter();
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const IconComponent = getNotificationIcon(notification.type);
  const iconBg = getNotificationIconBg(notification.type);
  const message = formatNotificationMessage(notification, t);
  const timeAgo = formatTimeAgo(notification.createdAt, t);
  const listDate = formatNotificationListDate(notification.createdAt, t, locale);
  const description = (notification.data && typeof notification.data.message === 'string')
    ? notification.data.message
    : '';

  const isVocabTrainerRemind = notification.type === ENotificationType.VOCAB_TRAINER && notification.action === ENotificationAction.REMIND;
  const isFsrsReminder = notification.data?.kind === ENotificationReminderKind.FSRS_DUE;
  const reminderTarget = isVocabTrainerRemind ? getReminderTarget(notification.data) : null;

  const handleMarkAsRead = async () => {
    if (!isRead && onMarkAsRead) {
      try {
        await markNotificationAsRead(notification.id);
        await onMarkAsRead();
        toast.success(t('markedRead'));
      } catch (error) {
        logger.error('Failed to mark notification as read:', { error });
        toast.error(t('markReadFailed'));
      }
    }
  };

  // A Reminder with unusable data stays unread, whether opened by the row or by its button.
  const handleRowClick = () => {
    if (isVocabTrainerRemind && !reminderTarget) {
      return;
    }
    void handleMarkAsRead();
  };

  const handleStartExam = async () => {
    if (!reminderTarget) {
      logger.error('Reminder notification has no usable trainer data:', { data: notification.data });
      toast.error(t('invalidData'));
      return;
    }

    await handleMarkAsRead();

    if (reminderTarget.isFsrs) {
      router.push(getReviewUrl(reminderTarget.trainerId));
      return;
    }

    const { trainerId, questionType } = reminderTarget;
    setIsLoadingExam(true);
    try {
      const examData = await getExam(trainerId);

      if (!examData) {
        throw new Error('No exam data received');
      }

      const storageKey = `exam_data_${trainerId}`;
      const examDataString = JSON.stringify(examData);
      localStorage.setItem(storageKey, examDataString);

      const verifyData = localStorage.getItem(storageKey);
      if (verifyData) {
        router.push(getExamUrl(trainerId, questionType));
      }
    } catch (error) {
      logger.error('Failed to load exam data:', { error });
      toast.error(t('examFailed'));
      setIsLoadingExam(false);
    }
  };

  const startButton = isVocabTrainerRemind
    ? (
        <button
          type="button"
          className="mt-2 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => {
            e.stopPropagation();
            void handleStartExam();
          }}
        >
          {isFsrsReminder ? t('startReview') : t('startExam')}
        </button>
      )
    : null;

  if (variant === 'page') {
    return (
      <div
        className={cn(
          'group relative flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20',
          itemIndex === 0 && 'mt-0',
        )}
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick();
          }
        }}
      >
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', iconBg, isRead && 'opacity-70')}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('font-semibold', isRead ? 'text-muted-foreground' : 'text-foreground')}>
            {message}
          </p>
          {description
            ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )
            : null}
          {startButton}
          <p className="mt-2 text-xs text-muted-foreground">{listDate}</p>
        </div>
        <div className="flex shrink-0 items-start">
          {isLoadingExam && (
            <RefreshCircle size={16} weight="BoldDuotone" className="animate-spin text-primary" />
          )}
          {!isRead && !isLoadingExam && (
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/20',
        itemIndex === 0 && 'mt-0',
      )}
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBg, isRead && 'opacity-70')}>
        <IconComponent className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'line-clamp-2 text-sm font-semibold',
            isRead ? 'text-muted-foreground' : 'text-foreground',
          )}
          >
            {message}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        {description
          ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>
            )
          : null}
        {startButton}
      </div>

      <div className="flex shrink-0 items-start pt-0.5">
        {isLoadingExam && (
          <RefreshCircle size={14} weight="BoldDuotone" className="animate-spin text-primary" />
        )}
        {!isRead && !isLoadingExam && (
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
        )}
      </div>
    </div>
  );
};
