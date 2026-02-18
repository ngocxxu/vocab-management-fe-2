'use client';

import type { EQuestionType } from '@/enum/vocab-trainer';
import type { NotificationItemProps } from '@/types/notification';
import { RefreshCircle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { getExam } from '@/actions';
import { markNotificationAsRead } from '@/actions/notifications';
import { getExamUrl } from '@/constants/vocab-trainer';
import { logger } from '@/libs/Logger';
import { cn } from '@/libs/utils';
import { ENotificationAction, ENotificationType } from '@/types/notification';
import {
  formatNotificationListDate,
  formatNotificationMessage,
  formatTimeAgo,
  getNotificationIcon,
  getNotificationIconBg,
} from './utils';

export const NotificationItem: React.FC<NotificationItemProps> = ({
  itemIndex,
  notification,
  isRead,
  onMarkAsRead,
  variant = 'dropdown',
  onDelete: _onDelete,
}) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const IconComponent = getNotificationIcon(notification.type);
  const iconBg = getNotificationIconBg(notification.type);
  const message = formatNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);
  const listDate = formatNotificationListDate(notification.createdAt);
  const description = (notification.data && typeof notification.data.message === 'string')
    ? notification.data.message
    : '';

  const isVocabTrainerRemind = notification.type === ENotificationType.VOCAB_TRAINER && notification.action === ENotificationAction.REMIND;

  const handleClick = async () => {
    if (!isRead && onMarkAsRead) {
      try {
        await markNotificationAsRead(notification.id);
        onMarkAsRead();
        toast.success('Notification marked as read');
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        toast.error('Failed to mark notification as read');
      }
    }

    if (isVocabTrainerRemind) {
      const data = notification.data || {};
      const trainerId = 'trainerId' in data && typeof data.trainerId === 'string' ? data.trainerId : undefined;
      const questionType = 'questionType' in data && typeof data.questionType === 'string' ? data.questionType as EQuestionType : undefined;

      if (!trainerId || !questionType) {
        logger.error('Missing trainerId or questionType:', { trainerId, questionType, data });
        toast.error('Invalid notification data');
        return;
      }

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
        console.error('Failed to load exam data:', error);
        toast.error('Failed to load exam. Please try again.');
        setIsLoadingExam(false);
      }
    }
  };

  if (variant === 'page') {
    return (
      <div
        className={cn(
          'group relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800/80',
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
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', iconBg, isRead && 'opacity-70')}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('font-semibold', isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white')}>
            {message}
          </p>
          {description
            ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )
            : null}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{listDate}</p>
        </div>
        <div className="flex shrink-0 items-start">
          {isLoadingExam && (
            <RefreshCircle size={16} weight="BoldDuotone" className="animate-spin text-blue-500" />
          )}
          {!isRead && !isLoadingExam && (
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer',
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
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBg, isRead && 'opacity-70')}>
        <IconComponent className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'line-clamp-2 text-sm font-semibold',
            isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100',
          )}
          >
            {message}
          </p>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{timeAgo}</span>
        </div>
        {description
          ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )
          : null}
        {isVocabTrainerRemind && (
          <button
            type="button"
            className="mt-2 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Start Exam
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-start pt-0.5">
        {isLoadingExam && (
          <RefreshCircle size={14} weight="BoldDuotone" className="animate-spin text-blue-500" />
        )}
        {!isRead && !isLoadingExam && (
          <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
        )}
      </div>
    </div>
  );
};
