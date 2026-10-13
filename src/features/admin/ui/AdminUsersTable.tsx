'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ResponseAPI } from '@/types';
import type { TAdminUser, TAdminUsersQuery } from '@/types/admin';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { DataTable } from '@/shared/ui/table';
import { useAdminUserActions } from '../hooks/useAdminUserActions';
import type { TAdminUsersUrlUpdate } from '../utils/admin-users-query';
import { buildAdminUsersSearch, formatAdminUserName } from '../utils/admin-users-query';
import { ActionsCell, NameCell, RoleCell, StatusCell } from './AdminUserCells';
import { AdminUsersFilters } from './AdminUsersFilters';
import { DeleteUserDialog } from './DeleteUserDialog';

type TAdminUsersTableProps = Readonly<{
  query: TAdminUsersQuery;
  page: ResponseAPI<TAdminUser[]>;
  currentUserId: string;
}>;

/** The users table. Search, filters, sort and paging live in the URL; the server reads them and returns the rows. */
export function AdminUsersTable({ query, page, currentUserId }: TAdminUsersTableProps) {
  const t = useTranslations('admin.users');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending, deleteTarget, setDeleteTarget, changeRole, toggleActive, confirmDelete } = useAdminUserActions();

  const replaceParams = (updates: TAdminUsersUrlUpdate) => {
    router.push(`?${buildAdminUsersSearch(new URLSearchParams(searchParams.toString()), updates)}`);
  };

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);
  const isSelfRow = useCallback((user: TAdminUser) => user.id === currentUserId, [currentUserId]);
  // The URL is the source of truth, so the header arrow always matches the rows on screen.
  const sorting = useMemo(() => [{ id: query.sortBy, desc: query.sortOrder === 'desc' }], [query.sortBy, query.sortOrder]);

  const columns = useMemo<ColumnDef<TAdminUser>[]>(() => [
    {
      id: 'name',
      accessorFn: formatAdminUserName,
      header: t('columns.name'),
      enableSorting: false,
      cell: ({ row }) => <NameCell user={row.original} isSelf={isSelfRow(row.original)} />,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: t('columns.email'),
      enableSorting: true,
      cell: ({ row }) => <span className="block max-w-[12rem] truncate text-muted-foreground" title={row.original.email}>{row.original.email}</span>,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: t('columns.role'),
      enableSorting: false,
      cell: ({ row }) => (
        <RoleCell
          user={row.original}
          isSelf={isSelfRow(row.original)}
          isPending={isPending}
          onChangeRole={role => changeRole(row.original, role)}
        />
      ),
    },
    {
      id: 'status',
      accessorKey: 'isActive',
      header: t('columns.status'),
      enableSorting: false,
      cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: t('columns.created'),
      enableSorting: true,
      cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{dateFormatter.format(new Date(row.original.createdAt))}</span>,
    },
    {
      id: 'actions',
      header: t('columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <ActionsCell
          user={row.original}
          isSelf={isSelfRow(row.original)}
          isPending={isPending}
          onToggleActive={() => toggleActive(row.original)}
          onDelete={() => setDeleteTarget(row.original)}
        />
      ),
    },
  ], [t, isSelfRow, isPending, changeRole, toggleActive, setDeleteTarget, dateFormatter]);

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={page.items}
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={query.q ?? ''}
        onSearchChangeAction={value => replaceParams({ q: value || undefined })}
        showSearch={true}
        showPagination={true}
        pageSize={query.pageSize}
        className=""
        headerClassName=""
        rowClassName=""
        cellClassName=""
        manualPagination={true}
        manualSorting={true}
        sorting={sorting}
        pageCount={page.totalPages}
        currentPage={page.currentPage}
        totalItems={page.totalItems}
        onPageChange={pageNumber => replaceParams({ page: String(pageNumber) })}
        onSortingChange={(sortBy, sortOrder) => replaceParams({ sortBy, sortOrder })}
        onPageSizeChange={pageSize => replaceParams({ pageSize: String(pageSize) })}
        filterTrigger={<AdminUsersFilters role={query.role} isActive={query.isActive} onChange={replaceParams} />}
      />

      {deleteTarget && (
        <DeleteUserDialog
          email={deleteTarget.email}
          open={deleteTarget !== null}
          isPending={isPending}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => confirmDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
