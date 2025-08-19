'use client';

import { useState } from 'react';
import { Header, Sidebar } from '@/components/dashboard';

export default function Layout(props: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        <Header onSidebarToggle={toggleSidebar} />
        <div className="flex-1 overflow-auto">
          {props.children}
        </div>
      </div>
    </div>
  );
}
