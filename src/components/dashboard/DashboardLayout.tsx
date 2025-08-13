'use client';

import React, { useState } from 'react';
import { DashboardContent } from './DashboardContent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        <Header onSidebarToggle={toggleSidebar} />
        <DashboardContent />
      </div>
    </div>
  );
};
