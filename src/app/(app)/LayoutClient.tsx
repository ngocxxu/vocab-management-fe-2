'use client';

import type { ResponseAPI } from '@/types';
import type { TUser } from '@/types/auth';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import type { TPlan } from '@/types/plan';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLayoutHeaderData } from '@/actions/layout-header';
import { Header, MobileBottomNav, Sidebar } from '@/components/dashboard';
import { useTranslations } from 'next-intl';
import { logger } from '@/libs/Logger';
import { SocketProvider, useSocket } from '@/providers/SocketProvider';

type LayoutClientProps = {
  children: React.ReactNode;
  currentUser?: TUser | null;
  currentPlan?: TPlan | null;
  initialAllNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadCount?: TUnreadCountResponse;
  chat?: React.ReactNode;
};

export function LayoutClient({
  children,
  currentUser,
  currentPlan,
  initialAllNotifications,
  initialUnreadNotifications,
  initialUnreadCount,
  chat,
}: LayoutClientProps) {
  const t = useTranslations('shell');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;
  const loadedHeaderDataKeyRef = useRef<string | null>(null);
  const [headerData, setHeaderData] = useState({
    currentPlan,
    allNotifications: initialAllNotifications,
    unreadNotifications: initialUnreadNotifications,
    unreadCount: initialUnreadCount,
  });
  const [isHeaderDataLoading, setIsHeaderDataLoading] = useState(Boolean(currentUser));
  const [headerDataError, setHeaderDataError] = useState(false);
  const latestRequestRef = useRef(0);

  // `silent` refreshes in the background: the list stays on screen instead of showing the loading text.
  // Only the newest request may write state, so a slow older response cannot overwrite newer data.
  const refreshHeaderData = useCallback(async (force = false, silent = false) => {
    if (!currentUserId) {
      loadedHeaderDataKeyRef.current = null;
      setIsHeaderDataLoading(false);
      return;
    }

    const headerDataKey = `${currentUserId}:${currentUserRole ?? ''}`;
    if (!force && loadedHeaderDataKeyRef.current === headerDataKey) {
      return;
    }

    loadedHeaderDataKeyRef.current = headerDataKey;
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    const isLatestRequest = () => requestId === latestRequestRef.current;
    if (!silent) {
      setIsHeaderDataLoading(true);
    }

    try {
      const data = await getLayoutHeaderData();
      if (!isLatestRequest()) {
        return;
      }
      setHeaderData({
        currentPlan: data.currentPlan,
        allNotifications: data.allNotifications,
        unreadNotifications: data.unreadNotifications,
        unreadCount: data.unreadCount,
      });
      setHeaderDataError(data.notificationsError);
    } catch (error) {
      if (!isLatestRequest()) {
        return;
      }
      loadedHeaderDataKeyRef.current = null;
      logger.error('Failed to load layout header data:', { error });
      setHeaderDataError(true);
    } finally {
      if (isLatestRequest()) {
        setIsHeaderDataLoading(false);
      }
    }
  }, [currentUserId, currentUserRole]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    void refreshHeaderData();
  }, [refreshHeaderData]);

  const handleSocketNotification = useCallback(() => {
    void refreshHeaderData(true, true);
  }, [refreshHeaderData]);

  const toggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarExpanded(prev => !prev);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const mainMargin = isDesktop ? (isSidebarExpanded ? 'md:ml-72' : 'md:ml-16') : '';

  return (
    <SocketProvider user={currentUser}>
      <NotificationSocketListener onNotification={handleSocketNotification} />
      <div className="flex h-screen bg-background">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/50 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isExpanded={isDesktop ? isSidebarExpanded : true}
          user={currentUser}
        />
        <div className={`ml-0 flex flex-1 flex-col transition-all duration-300 ease-in-out ${mainMargin}`}>
          <Header
            onSidebarToggle={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
            user={currentUser}
            currentPlan={headerData.currentPlan}
            allNotifications={headerData.allNotifications}
            unreadNotifications={headerData.unreadNotifications}
            unreadCount={headerData.unreadCount}
            isLoading={isHeaderDataLoading}
            error={headerDataError ? t('errors.loadNotifications') : null}
            onNotificationsChanged={() => refreshHeaderData(true)}
          />
          <div className="flex-1 overflow-auto bg-background pb-16 md:pb-0">
            {children}
          </div>
        </div>
        <MobileBottomNav user={currentUser} />
      </div>
      {chat}
    </SocketProvider>
  );
}

/** Refetches the bell when the BE pushes a Reminder. Must sit inside SocketProvider. The event carries no list data on purpose. */
function NotificationSocketListener({ onNotification }: { onNotification: () => void }) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket, onNotification]);

  return null;
}
