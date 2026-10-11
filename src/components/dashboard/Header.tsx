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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('shell');
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
      ? t('roles.admin')
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
            title={isSidebarExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
          >
            {isSidebarExpanded
              ? <HamburgerMenu size={64} weight="BoldDuotone" className="text-muted-foreground" />
              : <Siderbar size={20} weight="BoldDuotone" className="text-muted-foreground" />}
          </Button>

          <div className="relative flex flex-1 items-center rounded-full border border-border bg-muted md:max-w-xl">
            <Magnifer size={16} weight="BoldDuotone" className="ml-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder={t('header.searchPlaceholder')}
              className="h-10 flex-1 border-0 bg-transparent pr-2 pl-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              onFocus={openCommand}
              readOnly
              aria-label={t('header.search')}
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
              mounted ? (theme === 'dark' ? t('header.switchToLight') : t('header.switchToDark')) : t('header.toggleTheme')
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
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || t('sidebar.avatar')}
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
              title={t('sidebar.signOut')}
            >
              <Logout size={20} weight="BoldDuotone" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title={t('header.searchTitle')} description={t('header.searchDescription')}>
        <CommandInput
          placeholder={t('header.searchPlaceholder')}
          value={commandQuery}
          onValueChange={setCommandQuery}
        />
        <CommandList>
          <CommandEmpty>{t('header.noResults')}</CommandEmpty>
          {/*
            Deliberately a link to the search page, not a live search here: this
            component is mounted on every screen, so searching inline would fire
            an embedding call from the app shell on every keystroke.
          */}
          {commandQuery.trim().length > 0 && (
            <CommandGroup heading={t('header.heading')}>
              <CommandItem
                value={`search-${commandQuery}`}
                onSelect={() => runCommand(`/search?q=${encodeURIComponent(commandQuery.trim())}`)}
              >
                {t('header.searchAcross', { query: commandQuery.trim() })}
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading={t('header.suggestions')}>
            <CommandItem onSelect={() => runCommand('/dashboard')}>{t('nav.dashboard')}</CommandItem>
            <CommandItem onSelect={() => runCommand('/library')}>{t('nav.library')}</CommandItem>
            <CommandItem onSelect={() => runCommand('/vocab-trainer')}>{t('nav.vocabTrainer')}</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};
