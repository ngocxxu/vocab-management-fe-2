'use client';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import { Bell, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { markAllNotificationsAsRead } from '@/actions/notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  emptyMessage: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  emptyMessage,
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {notifications.map((notification, index) => (
        <React.Fragment key={notification.id}>
          <NotificationItem
            itemIndex={index}
            notification={notification}
            isRead={notification.recipients?.[0]?.isRead || false}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
          {index < notifications.length - 1 && (
            <Separator className="my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

type NotificationTabContentProps = {
  notifications: NotificationWithReadStatus[];
  isLoading: boolean;
  emptyMessage: string;
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
  emptyMessage,
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
          emptyMessage={emptyMessage}
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
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          <div className="flex items-center space-x-2">
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-slate-200 dark:border-slate-700">
            <TabsTrigger
              value="unread"
            >
              Unread
              {count > 0 && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  {count}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="all"
            >
              All
              <Badge variant="outline" className="ml-2 h-4 px-1 text-xs">
                {notifications.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Unread Tab */}
          <TabsContent value="unread" className="m-0">
            <NotificationTabContent
              notifications={displayedUnreadNotifications}
              isLoading={isLoading}
              emptyMessage="No unread notifications"
              displayedCount={displayedUnreadNotifications.length}
              totalCount={unreadNotificationsWithRecipients.length}
              scrollAreaRef={scrollAreaRef}
              onScroll={handleScroll}
              onMarkAsRead={handleNotificationRead}
              onDelete={handleNotificationDelete}
            />
          </TabsContent>

          {/* All Tab */}
          <TabsContent value="all" className="m-0">
            <NotificationTabContent
              notifications={displayedAllNotifications}
              isLoading={isLoading}
              emptyMessage="No notifications yet"
              displayedCount={displayedAllNotifications.length}
              totalCount={allNotificationsWithRecipients?.length || 0}
              scrollAreaRef={scrollAreaRef}
              onScroll={handleScroll}
              onMarkAsRead={handleNotificationRead}
              onDelete={handleNotificationDelete}
            />
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
