'use client';

import type { TNotification } from '@/types/notification';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { notificationMutations } from '@/hooks/useNotifications';
import { cn } from '@/libs/utils';
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
  onDelete,
}) => {
  const IconComponent = getNotificationIcon(notification.type);
  const StatusIcon = getNotificationStatusIcon(isRead, notification.priority);
  const iconColor = getNotificationIconColor(notification.priority);
  const message = formatNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);

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
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      try {
        await notificationMutations.delete(notification.id);
        onDelete();
        toast.success('Notification deleted');
      } catch (error) {
        console.error('Failed to delete notification:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 mt-2',
        !isRead && 'bg-blue-50/50 dark:bg-blue-950/20',
        itemIndex === 0 && 'mt-0',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={handleClick}
    >
      {/* Notification Icon */}
      <div className="flex-shrink-0">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700', iconColor)}>
          <IconComponent className="h-4 w-4" />
        </div>
      </div>

      {/* Notification Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium text-slate-900 dark:text-slate-100',
              !isRead && 'font-semibold',
            )}
            >
              {message}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {timeAgo}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="ml-2 flex-shrink-0">
            <StatusIcon className={cn(
              'h-3 w-3',
              isRead ? 'text-slate-400' : 'text-blue-500',
            )}
            />
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

      {/* Delete Button */}
      <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          onClick={handleDelete}
          title="Delete notification"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
