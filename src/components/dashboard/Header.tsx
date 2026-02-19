import { signout, verifyUser } from '@/actions';
import { getPlans } from '@/actions/plans';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/libs/utils';
import type { TPlan } from '@/types/plan';
import type { HeaderProps, TUser } from '@/types';
import { getPlanBadgeClassName, getPlanDisplayName } from '@/constants/plan';
import {
  HamburgerMenu,
  Logout,
  Magnifer,
  Moon,
  Siderbar,
  Sun,
  User,
} from '@solar-icons/react/ssr';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

export const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  isSidebarExpanded = true,
  allNotifications,
  unreadNotifications,
  unreadCount,
  isLoading = false,
  error = null,
}) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<TUser | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TPlan | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await verifyUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user?.role) {
      setCurrentPlan(null);
      return;
    }
    getPlans(user.role).then(plans => setCurrentPlan(plans[0] ?? null));
  }, [user?.role]);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

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

  const planBadgeLabel = (currentPlan ?? user?.role)
    ? user?.role === 'ADMIN'
      ? 'Admin'
      : currentPlan
        ? (() => {
            const priceSuffix = Number(currentPlan.priceLabel) ? ` - ${currentPlan.priceLabel}` : '';
            return `${currentPlan.name}${priceSuffix}`;
          })()
        : getPlanDisplayName(user?.role ?? '')
    : '';

  return (
    <header className="border-b border-border bg-card px-4 py-3 shadow-sm md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-xl hover:bg-accent"
            onClick={onSidebarToggle}
            title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarExpanded
              ? <HamburgerMenu size={64} weight="BoldDuotone" className="text-muted-foreground" />
              : <Siderbar size={20} weight="BoldDuotone" className="text-muted-foreground" />}
          </Button>

          <div className="relative flex flex-1 items-center rounded-full border border-border bg-muted md:max-w-xl">
            <Magnifer size={16} weight="BoldDuotone" className="ml-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search words, lists, or tags..."
              className="h-10 flex-1 border-0 bg-transparent pr-2 pl-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              onFocus={openCommand}
              readOnly
              aria-label="Search"
            />
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 h-7 shrink-0 rounded-md bg-muted-foreground/10 px-2 text-xs text-muted-foreground hover:bg-muted-foreground/20"
              onClick={openCommand}
            >
              CMD K
            </Button>
          </div>
        </div>

        <div className="flex h-10 items-center gap-2">
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
                    ? <Sun size={20} weight="BoldDuotone" className="text-muted-foreground" />
                    : <Moon size={20} weight="BoldDuotone" className="text-muted-foreground" />
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

          <Separator orientation="vertical" />

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
                    <User size={20} weight="BoldDuotone" className="text-primary-foreground" />
                  </div>
                )}
            <div className="hidden text-sm lg:block">
              <div className="font-medium text-foreground">
                {user?.firstName}
                {' '}
                {user?.lastName}
              </div>
              {(currentPlan ?? user?.role) && (
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide', getPlanBadgeClassName(user?.role ?? ''))}>
                  {planBadgeLabel}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg border-muted-foreground/30 hover:bg-accent"
              onClick={handleLogout}
              title="Sign out"
            >
              <Logout size={20} weight="BoldDuotone" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Search" description="Search words, lists, or tags.">
        <CommandInput placeholder="Search words, lists, or tags..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => router.push('/dashboard')}>Dashboard</CommandItem>
            <CommandItem onSelect={() => router.push('/library')}>Library</CommandItem>
            <CommandItem onSelect={() => router.push('/vocab-trainer')}>Flashcards</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};
