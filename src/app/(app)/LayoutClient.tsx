'use client';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/dashboard';
import { SocketProvider } from '@/providers/SocketProvider';

type LayoutClientProps = {
  children: React.ReactNode;
  initialAllNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadCount?: TUnreadCountResponse;
};

export function LayoutClient({
  children,
  initialAllNotifications,
  initialUnreadNotifications,
  initialUnreadCount,
}: LayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

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
    <SocketProvider>
      <div className="flex h-screen bg-background">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isExpanded={isDesktop ? isSidebarExpanded : true} />
        <div className={`ml-0 flex flex-1 flex-col transition-all duration-300 ease-in-out ${mainMargin}`}>
          <Header
            onSidebarToggle={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
            allNotifications={initialAllNotifications}
            unreadNotifications={initialUnreadNotifications}
            unreadCount={initialUnreadCount}
            isLoading={false}
            error={null}
          />
          <div className="flex-1 overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
