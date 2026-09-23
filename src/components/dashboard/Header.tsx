import { signoutClient } from '@/utils/auth-utils';
import { SupportButton } from '@/features/support';
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
import { logger } from '@/libs/Logger';
import { cn } from '@/libs/utils';
import type { HeaderProps } from '@/types';
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
  user,
  currentPlan,
  allNotifications,
  unreadNotifications,
  unreadCount,
  isLoading = false,
  error = null,
  onNotificationsChanged,
}) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  const openCommand = useCallback(() => setCommandOpen(true), []);

  /** Closing before navigating stops the palette reopening over the new page. */
  const runCommand = useCallback((path: string) => {
    setCommandOpen(false);
    setCommandQuery('');
    router.push(path);
  }, [router]);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/library');
    router.prefetch('/vocab-trainer');
  }, [router]);

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

  const handleLogout = () => {
    signoutClient('/').catch(error => logger.error('Logout error:', { error }));
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
            className="hidden h-10 w-10 flex-shrink-0 rounded-xl hover:bg-accent md:inline-flex"
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
            onNotificationsChanged={onNotificationsChanged}
          />

          <SupportButton userEmail={user?.email} inline />

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
        <CommandInput
          placeholder="Search words, lists, or tags..."
          value={commandQuery}
          onValueChange={setCommandQuery}
        />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {/*
            Deliberately a link to the search page, not a live search here: this
            component is mounted on every screen, so searching inline would fire
            an embedding call from the app shell on every keystroke.
          */}
          {commandQuery.trim().length > 0 && (
            <CommandGroup heading="Search">
              <CommandItem
                value={`search-${commandQuery}`}
                onSelect={() => runCommand(`/search?q=${encodeURIComponent(commandQuery.trim())}`)}
              >
                {`Search "${commandQuery.trim()}" across all vocab`}
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand('/dashboard')}>Dashboard</CommandItem>
            <CommandItem onSelect={() => runCommand('/library')}>Library</CommandItem>
            <CommandItem onSelect={() => runCommand('/vocab-trainer')}>Vocab Trainer</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};
