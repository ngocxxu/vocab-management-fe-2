import { signout, verifyUser } from '@/actions';
import { Button } from '@/components/ui/button';
import type { TUser } from '@/types/auth';
import { useTheme } from '@/hooks/useTheme';
import {
  Bell,
  Bookmark,
  HomeSmile,
  Library,
  Power,
  SquareAcademicCap,
  User,
} from '@solar-icons/react/ssr';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type MenuItem = {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
};

const mainMenuItems: MenuItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <HomeSmile size={20} weight="BoldDuotone" /> },
  { id: 'library', path: '/library', label: 'Library', icon: <Library size={20} weight="BoldDuotone" /> },
  { id: 'vocab-trainer', path: '/vocab-trainer', label: 'Vocab Trainer', icon: <SquareAcademicCap size={20} weight="BoldDuotone" /> },
];

const settingsMenuItems: MenuItem[] = [
  { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} weight="BoldDuotone" /> },
  { id: 'subjects', path: '/subjects', label: 'Subjects', icon: <Bookmark size={20} weight="BoldDuotone" /> },
  { id: 'notifications', path: '/notifications', label: 'Notifications', icon: <Bell size={20} weight="BoldDuotone" /> },
];

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isExpanded = true }) => {
  const collapsed = !isExpanded;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, mounted } = useTheme();
  const [user, setUser] = useState<TUser | null>(null);
  const logoSrc
    = !mounted || theme !== 'dark'
      ? '/assets/logo/logo-light-mode.png'
      : '/assets/logo/logo-dark-mode.png';

  useEffect(() => {
    const loadUser = async () => {
      const userData = await verifyUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleNav = (path: string) => {
    router.push(path);
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
    setUser(null);
    router.refresh();
    router.push('/signin');
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out md:translate-x-0 ${
        collapsed ? 'w-16' : 'w-72'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex-shrink-0 p-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Image
              src={logoSrc}
              alt="Vocab"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground">Vocab</span>
              <span className="text-xs font-medium tracking-wider text-primary uppercase">
                Precision Learning
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 space-y-6 overflow-y-auto transition-all duration-300 ${collapsed ? 'space-y-2 p-3' : 'p-6'}`}>
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Main Menu</p>
          )}
          {mainMenuItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Button
                key={`${item.id}-${item.label}`}
                variant="ghost"
                className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent ${
                  collapsed ? 'h-10 justify-center rounded-lg px-0' : 'h-11 justify-start rounded-xl px-4'
                } ${
                  isActive ? 'bg-accent text-primary hover:bg-accent hover:text-primary' : 'text-foreground hover:bg-accent hover:text-foreground'
                }`}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                  <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Button>
            );
          })}
        </div>
        {collapsed && <div className="border-t border-border" />}
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Settings</p>
          )}
          {settingsMenuItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Button
                key={`${item.id}-${item.label}`}
                variant="ghost"
                className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent ${
                  collapsed ? 'h-10 justify-center rounded-lg px-0' : 'h-11 justify-start rounded-xl px-4'
                } ${
                  isActive ? 'bg-accent text-primary hover:bg-accent hover:text-primary' : 'text-foreground hover:bg-accent hover:text-foreground'
                }`}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                  <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <div className={`flex-shrink-0 border-t border-border p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed
          ? (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg hover:bg-accent"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <Power size={20} weight="BoldDuotone" className="text-muted-foreground" />
                </Button>
                {user?.avatar
                  ? (
                      <Image
                        src={user.avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )
                  : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
              </div>
            )
          : (
              <div className="flex items-center justify-between rounded-xl bg-muted-foreground/10 p-4">
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'User'}
                    </p>
                    <p className="max-w-36 truncate text-sm text-muted-foreground" title={user?.email || 'user@example.com'}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-secondary"
                  onClick={handleSignOut}
                >
                  <Power size={16} weight="BoldDuotone" className="text-muted-foreground" />
                </Button>
              </div>
            )}
      </div>
    </aside>
  );
};
