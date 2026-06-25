'use client';

import type { ResponseAPI } from '@/types';
import type { TUser } from '@/types/auth';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import type { TPlan } from '@/types/plan';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLayoutHeaderData } from '@/actions/layout-header';
import { Header, Sidebar } from '@/components/dashboard';
import { logger } from '@/libs/Logger';
import { SocketProvider } from '@/providers/SocketProvider';
import { SupportButton } from '@/features/support';

type LayoutClientProps = {
  children: React.ReactNode;
  currentUser?: TUser | null;
  currentPlan?: TPlan | null;
  initialAllNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadCount?: TUnreadCountResponse;
};

export function LayoutClient({
  children,
  currentUser,
  currentPlan,
  initialAllNotifications,
  initialUnreadNotifications,
  initialUnreadCount,
}: LayoutClientProps) {
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
  const [headerDataError, setHeaderDataError] = useState<string | null>(null);

  const refreshHeaderData = useCallback(async (force = false) => {
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
    setIsHeaderDataLoading(true);
    setHeaderDataError(null);

    try {
      const data = await getLayoutHeaderData();
      setHeaderData({
        currentPlan: data.currentPlan,
        allNotifications: data.allNotifications,
        unreadNotifications: data.unreadNotifications,
        unreadCount: data.unreadCount,
      });
    } catch (error) {
      loadedHeaderDataKeyRef.current = null;
      logger.error('Failed to load layout header data:', { error });
      setHeaderDataError('Unable to load notifications');
    } finally {
      setIsHeaderDataLoading(false);
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
            error={headerDataError}
            onNotificationsChanged={() => refreshHeaderData(true)}
          />
          <div className="flex-1 overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
      <SupportButton userEmail={currentUser?.email} />
    </SocketProvider>
  );
}
