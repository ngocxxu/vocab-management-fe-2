'use client';

import type { NotificationTabContentProps } from '@/types/notification';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationList } from './NotificationList';

export const NotificationTabContent: React.FC<NotificationTabContentProps> = ({
  notifications,
  isLoading,
  hasError,
  displayedCount,
  totalCount,
  scrollAreaRef,
  onScroll,
  onMarkAsRead,
  onDelete,
}) => {
  const t = useTranslations('notifications');

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
          hasError={hasError}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      </ScrollArea>
      {displayedCount < totalCount && (
        <div className="py-2 text-center text-xs text-muted-foreground">
          {t('showing', { displayed: displayedCount, total: totalCount })}
        </div>
      )}
    </React.Fragment>
  );
};
