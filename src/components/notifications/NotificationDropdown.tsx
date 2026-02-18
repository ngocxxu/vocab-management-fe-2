'use client';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import { Bell } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { markAllNotificationsAsRead } from '@/actions/notifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/libs/utils';
import { NotificationItem } from './NotificationItem';

type NotificationDropdownProps = {
  className?: string;
  allNotifications?: ResponseAPI<TNotification[]> | null;
  unreadNotifications?: ResponseAPI<TNotification[]> | null;
  unreadCount?: TUnreadCountResponse | null;
  isLoading?: boolean;
  error?: string | null;
};

type NotificationWithReadStatus = TNotification & {
  isRead: boolean;
};

type NotificationListProps = {
  notifications: NotificationWithReadStatus[];
  isLoading: boolean;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

const NotificationList: React.FC<NotificationListProps> = ({
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

type NotificationTabContentProps = {
  notifications: NotificationWithReadStatus[];
  isLoading: boolean;
  displayedCount: number;
  totalCount: number;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

const NotificationTabContent: React.FC<NotificationTabContentProps> = ({
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

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
  allNotifications,
  unreadNotifications,
  unreadCount,
  isLoading = false,
  error = null,
}) => {
  const [displayedCount, setDisplayedCount] = useState(5);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const notifications = allNotifications?.items || [];
  const unreadNotificationsList = unreadNotifications?.items || [];
  const count = unreadCount?.count || 0;

  useEffect(() => {
    setDisplayedCount(5);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationRead = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleNotificationDelete = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Load more when scrolled to bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setDisplayedCount(prev => prev + 5);
    }
  }, []);

  const unreadNotificationsWithRecipients = unreadNotificationsList.map(notification => ({
    ...notification,
    isRead: false,
  }));

  const allNotificationsWithRecipients = notifications?.map((notification) => {
    // Find the recipient info for current user
    const recipient = notification.recipients?.find(r => r.userId);
    return {
      ...notification,
      isRead: recipient?.isRead || false,
    };
  });

  // Get displayed notifications (first N items)
  const displayedUnreadNotifications = unreadNotificationsWithRecipients.slice(0, displayedCount);
  const displayedAllNotifications = allNotificationsWithRecipients?.slice(0, displayedCount) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800',
            className,
          )}
        >
          <Bell size={20} weight="BoldDuotone" className="text-slate-600 dark:text-slate-400" />
          {count > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500"
              aria-label={`${count} unread notifications`}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="border-b border-slate-200 px-4 dark:border-slate-700">
          <div className="flex items-end gap-0" role="tablist" aria-label="Notification filters">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              tabIndex={activeTab === 'all' ? 0 : -1}
              onClick={() => setActiveTab('all')}
              className={cn(
                'relative pb-2.5 pr-3 pt-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                activeTab === 'all'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              All
              {activeTab === 'all' && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  aria-hidden
                />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'unread'}
              tabIndex={activeTab === 'unread' ? 0 : -1}
              onClick={() => setActiveTab('unread')}
              className={cn(
                'relative flex items-center gap-1.5 pb-2.5 pl-0 pr-0 pt-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                activeTab === 'unread'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              Unread
              {' '}
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                (
                {count}
                )
              </span>
              {activeTab === 'unread' && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-12 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'unread' && (
          <div className="m-0">
            <NotificationTabContent
              notifications={displayedUnreadNotifications}
              isLoading={isLoading}
              displayedCount={displayedUnreadNotifications.length}
              totalCount={unreadNotificationsWithRecipients.length}
              scrollAreaRef={scrollAreaRef}
              onScroll={handleScroll}
              onMarkAsRead={handleNotificationRead}
              onDelete={handleNotificationDelete}
            />
          </div>
        )}
        {activeTab === 'all' && (
          <div className="m-0">
            <NotificationTabContent
              notifications={displayedAllNotifications}
              isLoading={isLoading}
              displayedCount={displayedAllNotifications.length}
              totalCount={allNotificationsWithRecipients?.length || 0}
              scrollAreaRef={scrollAreaRef}
              onScroll={handleScroll}
              onMarkAsRead={handleNotificationRead}
              onDelete={handleNotificationDelete}
            />
          </div>
        )}

        <div className="border-t border-slate-200 py-2 text-center dark:border-slate-700">
          <Link
            href="/notifications"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            {notifications.length === 0 ? 'View notification history' : 'View all notifications'}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
