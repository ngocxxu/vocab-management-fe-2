import type { ResponseAPI } from '@/types';
import type { TUser } from '@/types/auth';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import { LogOut, Menu, Moon, Search, Sun, User } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { signout, verifyUser } from '@/actions';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/useTheme';

type HeaderProps = {
  onSidebarToggle: () => void;
  initialAllNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadNotifications?: ResponseAPI<TNotification[]>;
  initialUnreadCount?: TUnreadCountResponse;
};

export const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  initialAllNotifications,
  initialUnreadNotifications,
  initialUnreadCount,
}) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<TUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await verifyUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Navigation items configuration
  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Library', path: '/library' },
    { label: 'Vocab Trainer', path: '/vocab-trainer' },
    { label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await signout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="border-b border-slate-200/60 bg-white px-6 py-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search..."
              className="h-10 w-64 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-400"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navigationItems.map((item) => {
              // Special handling for vocab-trainer to include exam pages
              const isActive = item.path === '/vocab-trainer'
                ? pathname.startsWith('/vocab-trainer')
                : pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`h-auto p-0 text-sm font-medium transition-colors hover:bg-transparent hover:text-slate-900 dark:text-slate-400 dark:hover:bg-transparent dark:hover:text-slate-200 ${
                    isActive
                      ? 'text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500'
                      : 'text-slate-600  hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={toggleTheme}
            title={
              mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'
            }
          >
            {mounted
              ? (
                  theme === 'dark'
                    ? <Sun className="h-5 w-5 text-slate-400" />
                    : <Moon className="h-5 w-5 text-slate-600" />
                )
              : (
                  <div className="h-5 w-5" />
                )}
          </Button>

          {/* Notifications */}
          <NotificationDropdown
            initialAllNotifications={initialAllNotifications}
            initialUnreadNotifications={initialUnreadNotifications}
            initialUnreadCount={initialUnreadCount}
          />

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2">
            {user?.avatar
              ? (
                  <Image
                    src={user.avatar}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Avatar'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover shadow-sm"
                  />
                )
              : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
            <div className="text-sm">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {user?.firstName}
                {' '}
                {user?.lastName}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {user?.email}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
