'use client';

import type { NotificationListProps } from '@/types/notification';
import { Bell } from '@solar-icons/react/ssr';
import React from 'react';
import { NotificationItem } from './NotificationItem';

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_0_24px_rgba(99,102,241,0.12)] dark:bg-slate-800 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_24px_rgba(99,102,241,0.2)]">
          <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-indigo-400/80 dark:bg-indigo-400" />
          <span className="absolute top-6 right-6 h-1 w-1 rounded-full bg-indigo-400/60 dark:bg-indigo-500" />
          <Bell size={52} weight="BoldDuotone" className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h4 className="mt-4 font-semibold text-slate-900 dark:text-white">All caught up!</h4>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Check back later for progress updates and reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          itemIndex={index}
          notification={notification}
          isRead={notification.isRead ?? notification.recipients?.[0]?.isRead ?? false}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
