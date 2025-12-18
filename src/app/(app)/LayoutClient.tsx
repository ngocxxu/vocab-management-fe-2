'use client';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SocketProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar isOpen={isSidebarOpen} />
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-72' : 'ml-0'
          }`}
        >
          <Header
            onSidebarToggle={toggleSidebar}
            initialAllNotifications={initialAllNotifications}
            initialUnreadNotifications={initialUnreadNotifications}
            initialUnreadCount={initialUnreadCount}
          />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
