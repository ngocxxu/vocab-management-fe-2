'use client';

import type { MenuItem } from '@/types';
import type { TUser } from '@/types/auth';
import {
  Bell,
  Bookmark,
  HomeSmile,
  Key,
  Library,
  MenuDots,
  Power,
  SquareAcademicCap,
  User,
} from '@solar-icons/react/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signoutClient } from '@/utils/auth-utils';
import { logger } from '@/libs/Logger';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const tabItems: MenuItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <HomeSmile size={22} weight="BoldDuotone" /> },
  { id: 'library', path: '/library', label: 'Library', icon: <Library size={22} weight="BoldDuotone" /> },
  { id: 'vocab-trainer', path: '/vocab-trainer', label: 'Trainer', icon: <SquareAcademicCap size={22} weight="BoldDuotone" /> },
  { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={22} weight="BoldDuotone" /> },
];

const moreItems: MenuItem[] = [
  { id: 'subjects', path: '/subjects', label: 'Subjects', icon: <Bookmark size={20} weight="BoldDuotone" /> },
  { id: 'notifications', path: '/notifications', label: 'Notifications', icon: <Bell size={20} weight="BoldDuotone" /> },
  { id: 'api-keys', path: '/api-keys', label: 'API Keys', icon: <Key size={20} weight="BoldDuotone" /> },
];

// ponytail: exam routes get full-screen real estate, tab bar would eat the tight mobile viewport
const HIDDEN_PATH_PATTERN = /^\/vocab-trainer\/[^/]+\/exam/;

type MobileBottomNavProps = {
  user?: TUser | null;
};

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (HIDDEN_PATH_PATTERN.test(pathname)) {
    return null;
  }

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isMoreActive = moreItems.some(item => isActivePath(item.path));

  const visibleMoreItems = moreItems.filter(item => item.id !== 'api-keys' || user?.role !== 'GUEST');

  const handleSignOut = () => {
    signoutClient('/signin').catch(error => logger.error('Sign out failed:', { error }));
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-lg md:hidden"
      aria-label="Primary"
    >
      {tabItems.map((item) => {
        const isActive = isActivePath(item.path);
        return (
          <Link
            key={item.id}
            href={item.path}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="text-[10px] leading-tight font-medium">{item.label}</span>
          </Link>
        );
      })}

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap ${
            isMoreActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <MenuDots size={20} weight="BoldDuotone" />
          <span className="text-[10px] leading-tight font-medium">More</span>
        </button>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-1 px-4 pb-4">
            {visibleMoreItems.map(item => (
              <DrawerClose key={item.id} asChild>
                <Link
                  href={item.path}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-base font-medium ${
                    isActivePath(item.path) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </DrawerClose>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 text-base font-medium text-destructive hover:bg-destructive/10"
            >
              <Power size={20} weight="BoldDuotone" />
              Sign out
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
