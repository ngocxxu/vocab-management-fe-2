import type { ReactNode } from 'react';
import type { TAdminUser, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { ADMIN_USER_ROLES } from '@/constants/admin';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { formatAdminUserName } from '../utils/admin-users-query';

/** One option per admin role. Shared by the row role select and the role filter. */
export function RoleOptions() {
  const t = useTranslations('admin.users');
  return (
    <>
      {ADMIN_USER_ROLES.map(role => (
        <SelectItem key={role} value={role}>{t(`roles.${role}`)}</SelectItem>
      ))}
    </>
  );
}

/**
 * Explains why a row's controls are locked. The children ignore the pointer, so hovering a disabled
 * control still reaches the wrapper and shows the tooltip. Screen readers get the same hint as text.
 */
function LockedRow({ isSelf, children }: Readonly<{ isSelf: boolean; children: ReactNode }>) {
  const t = useTranslations('admin.users');
  if (!isSelf) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <span className="pointer-events-none inline-flex">{children}</span>
          <span className="sr-only">{t('lockedHint')}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{t('lockedHint')}</TooltipContent>
    </Tooltip>
  );
}

export function NameCell({ user, isSelf }: Readonly<{ user: TAdminUser; isSelf: boolean }>) {
  const t = useTranslations('admin.users');
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground" aria-hidden="true">
        {user.firstName.charAt(0)}
        {user.lastName.charAt(0)}
      </span>
      <span className="font-medium text-foreground">{formatAdminUserName(user)}</span>
      {isSelf && <Badge variant="outline">{t('you')}</Badge>}
    </div>
  );
}

export function RoleCell({ user, isSelf, isPending, onChangeRole }: Readonly<{
  user: TAdminUser;
  isSelf: boolean;
  isPending: boolean;
  onChangeRole: (role: TAdminUserRole) => void;
}>) {
  const t = useTranslations('admin.users');
  return (
    <LockedRow isSelf={isSelf}>
      <Select
        value={user.role}
        disabled={isSelf || isPending}
        onValueChange={(value) => {
          const role = ADMIN_USER_ROLES.find(option => option === value);
          if (role && role !== user.role) {
            onChangeRole(role);
          }
        }}
      >
        <SelectTrigger className="h-8 w-36 bg-card" aria-label={t('actions.changeRole')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <RoleOptions />
        </SelectContent>
      </Select>
    </LockedRow>
  );
}

export function StatusCell({ isActive }: Readonly<{ isActive: boolean }>) {
  const t = useTranslations('admin.users');
  return <Badge variant={isActive ? 'secondary' : 'outline'}>{isActive ? t('statusActive') : t('statusDeactivated')}</Badge>;
}

export function ActionsCell({ user, isSelf, isPending, onToggleActive, onDelete }: Readonly<{
  user: TAdminUser;
  isSelf: boolean;
  isPending: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}>) {
  const t = useTranslations('admin.users');
  return (
    <LockedRow isSelf={isSelf}>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={isSelf || isPending} onClick={onToggleActive}>
          {user.isActive ? t('actions.deactivate') : t('actions.reactivate')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={isSelf || isPending}
          onClick={onDelete}
        >
          {t('actions.delete')}
        </Button>
      </div>
    </LockedRow>
  );
}
