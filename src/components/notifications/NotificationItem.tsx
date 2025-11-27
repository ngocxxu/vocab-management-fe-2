'use client';

import type { TNotification } from '@/types/notification';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { getExamUrl } from '@/constants/vocab-trainer';
import { notificationMutations } from '@/hooks/useNotifications';
import { cn } from '@/libs/utils';
import { ENotificationAction, ENotificationType } from '@/types/notification';
import { vocabTrainerApi } from '@/utils/client-api';
import {
  formatNotificationMessage,
  formatTimeAgo,
  getNotificationIcon,
  getNotificationIconColor,
  getNotificationStatusIcon,
} from './utils';

type NotificationItemProps = {
  itemIndex: number;
  notification: TNotification;
  isRead: boolean;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  itemIndex,
  notification,
  isRead,
  onMarkAsRead,
  // onDelete,
}) => {
  const router = useRouter();
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const IconComponent = getNotificationIcon(notification.type);
  const StatusIcon = getNotificationStatusIcon(isRead, notification.priority);
  const iconColor = getNotificationIconColor(notification.priority);
  const message = formatNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);

  const isVocabTrainerRemind = notification.type === ENotificationType.VOCAB_TRAINER && notification.action === ENotificationAction.REMIND;

  const handleClick = async () => {
    if (!isRead && onMarkAsRead) {
      try {
        await notificationMutations.markAsRead(notification.id);
        onMarkAsRead();
        toast.success('Notification marked as read');
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        toast.error('Failed to mark notification as read');
      }
    }

    if (isVocabTrainerRemind) {
      const { trainerId, questionType } = notification.data || {};

      if (!trainerId || !questionType) {
        console.error('Missing trainerId or questionType:', { trainerId, questionType });
        toast.error('Invalid notification data');
        return;
      }

      setIsLoadingExam(true);
      try {
        const examData = await vocabTrainerApi.getExam(trainerId);

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
        console.error('Failed to load exam data:', error);
        toast.error('Failed to load exam. Please try again.');
        setIsLoadingExam(false);
      }
    }
  };

  // const handleDelete = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (onDelete) {
  //     try {
  //       await notificationMutations.delete(notification.id);
  //       onDelete();
  //       toast.success('Notification deleted');
  //     } catch (error) {
  //       console.error('Failed to delete notification:', error);
  //       toast.error('Failed to delete notification');
  //     }
  //   }
  // };

  return (
    <div
      className={cn(
        'group relative flex items-start space-x-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer',
        itemIndex === 0 && 'mt-0',
      )}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Notification Icon */}
      <div className="flex-shrink-0">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700', iconColor, isRead && 'opacity-60')}>
          <IconComponent className="h-4 w-4" />
        </div>
      </div>

      {/* Notification Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100',
              !isRead && 'font-semibold',
            )}
            >
              {message}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {timeAgo}
            </p>
          </div>

        </div>

        {/* Priority Badge */}
        {notification.priority === 'HIGH' && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-200">
              High Priority
            </span>
          </div>
        )}
      </div>

      {/* Status Indicator / Loading */}
      <div className="flex flex-shrink-0 flex-col items-end justify-end gap-1">
        {isLoadingExam && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        )}
        {!isRead && !isLoadingExam && (
          <StatusIcon className={cn(
            'size-3',
            'text-blue-500',
          )}
          />
        )}
      </div>

      {/* Delete Button */}
      {/* <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          onClick={handleDelete}
          title="Delete notification"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div> */}
    </div>
  );
};
