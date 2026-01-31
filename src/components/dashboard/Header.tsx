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
  allNotifications?: ResponseAPI<TNotification[]> | null;
  unreadNotifications?: ResponseAPI<TNotification[]> | null;
  unreadCount?: TUnreadCountResponse | null;
  isLoading?: boolean;
  error?: string | null;
};

export const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  allNotifications,
  unreadNotifications,
  unreadCount,
  isLoading = false,
  error = null,
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
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    router.refresh();
    router.push('/');
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3 shadow-sm md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-xl hover:bg-accent"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="relative flex-1 md:flex-none">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-10 w-full rounded-xl border-border bg-muted pl-10 text-sm focus:border-primary focus:ring-primary md:w-64"
            />
          </div>

          <div className="hidden items-center space-x-6 lg:flex">
            {navigationItems.map((item) => {
              const isActive = item.path === '/vocab-trainer'
                ? pathname.startsWith('/vocab-trainer')
                : pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`h-auto p-0 text-sm font-medium transition-colors hover:bg-transparent ${
                    isActive ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-xl hover:bg-accent"
            onClick={toggleTheme}
            title={
              mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'
            }
          >
            {mounted
              ? (
                  theme === 'dark'
                    ? <Sun className="h-5 w-5 text-muted-foreground" />
                    : <Moon className="h-5 w-5 text-muted-foreground" />
                )
              : (
                  <div className="h-5 w-5" />
                )}
          </Button>

          <NotificationDropdown
            allNotifications={allNotifications}
            unreadNotifications={unreadNotifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            error={error}
          />

          <div className="hidden items-center space-x-2 sm:flex">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
            <div className="hidden text-sm lg:block">
              <div className="font-medium text-foreground">
                {user?.firstName}
                {' '}
                {user?.lastName}
              </div>
              <div className="text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-accent"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
