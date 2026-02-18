'use client';

import type { NotificationTabContentProps } from '@/types/notification';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationList } from './NotificationList';

export const NotificationTabContent: React.FC<NotificationTabContentProps> = ({
  notifications,
  isLoading,
  displayedCount,
  totalCount,
  scrollAreaRef,
  onScroll,
  onMarkAsRead,
  onDelete,
}) => {
  return (
    <React.Fragment>
      <ScrollArea
        className="h-90"
        ref={scrollAreaRef}
        onScrollCapture={onScroll}
      >
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      </ScrollArea>
      {displayedCount < totalCount && (
        <div className="py-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Showing
          {' '}
          {displayedCount}
          {' '}
          of
          {' '}
          {totalCount}
          {' '}
          notifications
        </div>
      )}
    </React.Fragment>
  );
};
