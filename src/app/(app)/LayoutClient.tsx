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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
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
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

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
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ease-in-out md:ml-72 ${
            isSidebarOpen ? 'ml-0 md:ml-72' : 'ml-0'
          }`}
        >
          <Header
            onSidebarToggle={toggleSidebar}
            allNotifications={initialAllNotifications}
            unreadNotifications={initialUnreadNotifications}
            unreadCount={initialUnreadCount}
            isLoading={false}
            error={null}
          />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
