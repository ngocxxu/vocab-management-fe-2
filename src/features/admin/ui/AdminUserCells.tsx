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
 * Explains why a row's controls are locked. The admin's own row wins over `hint`. The children ignore the pointer,
 * so hovering a disabled control still reaches the wrapper and shows the tooltip. Screen readers get the same hint as text.
 */
function LockedRow({ isSelf, hint, children }: Readonly<{ isSelf: boolean; hint?: string; children: ReactNode }>) {
  const t = useTranslations('admin.users');
  const reason = isSelf ? t('lockedHint') : hint;
  if (!reason) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <span className="pointer-events-none inline-flex">{children}</span>
          <span className="sr-only">{reason}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
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
        <SelectTrigger className="h-8 w-32 bg-card" aria-label={t('actions.changeRole')}>
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

/** Shows whether the user may use the public MCP endpoint, with the control that switches it. */
export function McpAccessCell({ user, isSelf, isPending, onToggleMcpAccess }: Readonly<{
  user: TAdminUser;
  isSelf: boolean;
  isPending: boolean;
  onToggleMcpAccess: () => void;
}>) {
  const t = useTranslations('admin.users');
  // The plan decides who may use MCP: a GUEST cannot, so the switch has nothing to change.
  const isNotInPlan = user.role === 'GUEST';
  return (
    <LockedRow isSelf={isSelf} hint={isNotInPlan ? t('mcpNotInPlanHint') : undefined}>
      <div className="flex items-center gap-2">
        {isNotInPlan
          ? <Badge variant="outline">{t('mcpNotInPlan')}</Badge>
          : <Badge variant={user.mcpAccess ? 'secondary' : 'outline'}>{user.mcpAccess ? t('mcpOn') : t('mcpOff')}</Badge>}
        <Button variant="outline" size="sm" disabled={isSelf || isPending || isNotInPlan} onClick={onToggleMcpAccess}>
          {user.mcpAccess ? t('actions.disableMcp') : t('actions.enableMcp')}
        </Button>
      </div>
    </LockedRow>
  );
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
