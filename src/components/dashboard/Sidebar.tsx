import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Library,
  Power,
  Settings,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { authMutations, useAuth } from '@/hooks/useAuth';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasArrow?: boolean;
  subItems?: Array<{
    id: string;
    label: string;
    status: 'active' | 'done' | 'hold';
  }>;
  notification?: number;
  category?: string;
};

const menuItems: MenuItem[] = [
  // Main navigation items
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'library', label: 'Library', icon: <Library className="h-5 w-5" /> },
  { id: 'vocab-trainer', label: 'Vocab Trainer', icon: <GraduationCap className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

type SidebarProps = {
  isOpen: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, mutate } = useAuth();

  // Get the current active item from pathname
  const getCurrentActiveItem = () => {
    const currentPath = pathname.split('/')[1];
    return currentPath || 'dashboard'; // Default to dashboard if no path
  };

  const handleButtonClick = (buttonId: string) => {
    router.push(`/${buttonId}`);
  };

  const handleSignOut = async () => {
    try {
      await authMutations.signout();
      // Clear the auth cache
      mutate();
      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200/60 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-slate-700/60 dark:bg-slate-900 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo Section - Fixed at top */}
      <div className="flex-shrink-0 border-b border-slate-200/60 p-4 dark:border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vocabulary</h1>
        </div>
      </div>

      {/* Scrollable Menu Items Section */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Main navigation items */}
        <div className="space-y-2">
          {menuItems.filter(item => !item.category).map((item) => {
            const isActive = getCurrentActiveItem() === item.id;
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  className={`h-11 w-full cursor-pointer justify-between rounded-xl px-4 text-slate-700 transition-all duration-300 ease-in-out hover:bg-blue-50 hover:text-blue-500 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 ${
                    isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-blue-600 hover:text-white dark:text-white dark:hover:bg-blue-600 dark:hover:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => handleButtonClick(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasArrow && <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Section - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-slate-200/60 p-4 dark:border-slate-700/60">
        <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex items-center space-x-3">
            {user?.avatar
              ? (
                  <Image
                    src={user.avatar}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Avatar'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )
              : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'User'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={handleSignOut}
          >
            <Power className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
