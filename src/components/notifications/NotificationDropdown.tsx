'use client';

import type { NotificationDropdownProps } from '@/types/notification';
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
import { cn } from '@/libs/utils';
import { NotificationTabContent } from './NotificationTabContent';

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
