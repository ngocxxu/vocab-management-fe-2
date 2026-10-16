import { signoutClient } from '@/utils/auth-utils';
import { logger } from '@/libs/Logger';
import { Button } from '@/components/ui/button';
import type { MenuItem, SidebarProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { isAdmin } from '@/utils/is-admin';
import {
  Bell,
  Bookmark,
  HomeSmile,
  Key,
  Library,
  Power,
  ShieldUser,
  SquareAcademicCap,
  User,
} from '@solar-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

const mainMenuItems: MenuItem[] = [
  { id: 'dashboard', path: '/dashboard', labelKey: 'nav.dashboard', icon: <HomeSmile size={20} weight="BoldDuotone" /> },
  { id: 'library', path: '/library', labelKey: 'nav.library', icon: <Library size={20} weight="BoldDuotone" /> },
  { id: 'vocab-trainer', path: '/vocab-trainer', labelKey: 'nav.vocabTrainer', icon: <SquareAcademicCap size={20} weight="BoldDuotone" /> },
];

const settingsMenuItems: MenuItem[] = [
  { id: 'profile', path: '/profile', labelKey: 'nav.profile', icon: <User size={20} weight="BoldDuotone" /> },
  { id: 'subjects', path: '/subjects', labelKey: 'nav.subjects', icon: <Bookmark size={20} weight="BoldDuotone" /> },
  { id: 'notifications', path: '/notifications', labelKey: 'nav.notifications', icon: <Bell size={20} weight="BoldDuotone" /> },
  { id: 'api-keys', path: '/api-keys', labelKey: 'nav.apiKeys', icon: <Key size={20} weight="BoldDuotone" /> },
  { id: 'admin', path: '/admin', labelKey: 'nav.admin', icon: <ShieldUser size={20} weight="BoldDuotone" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isExpanded = true, user }) => {
  const t = useTranslations('shell');
  const collapsed = !isExpanded;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, mounted } = useTheme();
  const logoSrc
    = !mounted || theme !== 'dark'
      ? '/assets/logo/logo-light-mode.png'
      : '/assets/logo/logo-dark-mode.png';

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const visibleSettingsMenuItems = settingsMenuItems.filter(item => (item.id !== 'api-keys' || user?.role !== 'GUEST') && (item.id !== 'admin' || isAdmin(user)));

  useEffect(() => {
    for (const item of [...mainMenuItems, ...visibleSettingsMenuItems]) {
      router.prefetch(item.path);
    }
  }, [router, visibleSettingsMenuItems]);

  const handleNav = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSignOut = () => {
    signoutClient('/').catch(error => logger.error('Sign out failed:', { error }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out md:translate-x-0 ${
        collapsed ? 'w-16' : 'w-72'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex-shrink-0 p-4">
        <Link
          href="/dashboard"
          onClick={handleNav}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
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
                Intelligence
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className={`flex-1 space-y-6 overflow-y-auto transition-all duration-300 ${collapsed ? 'space-y-2 p-3' : 'p-6'}`}>
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">{t('sidebar.mainMenu')}</p>
          )}
          {mainMenuItems.map((item) => {
            const isActive = isActivePath(item.path);
            const label = t(item.labelKey);
            return (
              <Button
                key={item.id}
                variant="ghost"
                asChild
                className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent ${
                  collapsed ? 'h-10 justify-center rounded-lg px-0' : 'h-11 justify-start rounded-xl px-4'
                } ${
                  isActive ? 'bg-accent text-primary hover:bg-accent hover:text-primary' : 'text-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={collapsed ? label : undefined}
              >
                <Link href={item.path} onClick={handleNav}>
                  <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.icon}</span>
                  {!collapsed && <span className="font-medium">{label}</span>}
                </Link>
              </Button>
            );
          })}
        </div>
        {collapsed && <div className="border-t border-border" />}
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">{t('sidebar.settings')}</p>
          )}
          {visibleSettingsMenuItems.map((item) => {
            const isActive = isActivePath(item.path);
            const label = t(item.labelKey);
            return (
              <Button
                key={item.id}
                variant="ghost"
                asChild
                className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent ${
                  collapsed ? 'h-10 justify-center rounded-lg px-0' : 'h-11 justify-start rounded-xl px-4'
                } ${
                  isActive ? 'bg-accent text-primary hover:bg-accent hover:text-primary' : 'text-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={collapsed ? label : undefined}
              >
                <Link href={item.path} onClick={handleNav}>
                  <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.icon}</span>
                  {!collapsed && <span className="font-medium">{label}</span>}
                </Link>
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
                  title={t('sidebar.signOut')}
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
                          alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || t('sidebar.avatar')}
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
                        : t('sidebar.user')}
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
                  title={t('sidebar.signOut')}
                >
                  <Power size={16} weight="BoldDuotone" className="text-muted-foreground" />
                </Button>
              </div>
            )}
      </div>
    </aside>
  );
};
