import type { TAdminUserRole } from '@/types/admin';
import type { TAdminUsersUrlUpdate } from '../utils/admin-users-query';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { RoleOptions } from './AdminUserCells';

const ALL = 'all';

type TAdminUsersFiltersProps = Readonly<{
  role?: TAdminUserRole;
  isActive?: boolean;
  onChange: (updates: TAdminUsersUrlUpdate) => void;
}>;

/** Role and status filters. Each change goes to the URL through `onChange`. */
export function AdminUsersFilters({ role, isActive, onChange }: TAdminUsersFiltersProps) {
  const t = useTranslations('admin.users');
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={role ?? ALL} onValueChange={value => onChange({ role: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-9 w-40 bg-card/80" aria-label={t('filters.role')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('filters.allRoles')}</SelectItem>
          <RoleOptions />
        </SelectContent>
      </Select>
      <Select
        value={isActive === undefined ? ALL : String(isActive)}
        onValueChange={value => onChange({ isActive: value === ALL ? undefined : value })}
      >
        <SelectTrigger className="h-9 w-40 bg-card/80" aria-label={t('filters.status')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="true">{t('filters.active')}</SelectItem>
          <SelectItem value="false">{t('filters.deactivated')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
