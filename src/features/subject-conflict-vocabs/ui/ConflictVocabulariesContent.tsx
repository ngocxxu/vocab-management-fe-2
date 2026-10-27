'use client';

import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TVocabConflictListResponse } from '@/types/vocab-conflict';
import { AltArrowLeft, CloseCircle, DangerTriangle, Filter, InfoCircle } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { bulkUpdateVocabs, deleteVocab, deleteVocabsBulk, getVocabsByIds, updateVocab } from '@/actions/vocabs';
import { cn } from '@/libs/utils';
import { vocabInUseMessage } from '@/utils/vocab-in-use';
import { buildVocabUpdateForSubjectReassign } from '@/utils/build-vocab-reassign-update';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/shared/ui/shared';
import { DataTable } from '@/shared/ui/table';
import { useApiPagination, useBulkDelete } from '@/hooks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/shared/ui/multi-select';
import { RowReassignSubjectsPopover } from './RowReassignSubjectsPopover';

const PREVIEW_PAGE_SIZE = 10;

function formatConflictDate(iso: string | undefined, locale: string): string {
  if (!iso) {
    return '—';
  }
  try {
    return new Date(iso).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export type ConflictVocabulariesContentProps = Readonly<{
  subjectId: string;
  initialConflictData?: TVocabConflictListResponse;
  initialSubjectsData?: TSubjectResponse;
  conflictSubjectName?: string | null;
  loadFailed: boolean;
}>;

export default function ConflictVocabulariesContent({
  subjectId,
  initialConflictData,
  initialSubjectsData,
  conflictSubjectName,
  loadFailed,
}: ConflictVocabulariesContentProps) {
  const t = useTranslations('subjects');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignIds, setReassignIds] = useState<string[]>([]);
  const [bulkTargetSubjectIds, setBulkTargetSubjectIds] = useState<string[]>([]);
  const [previewVisibleCount, setPreviewVisibleCount] = useState(PREVIEW_PAGE_SIZE);
  const [subjectMultiSelectKey, setSubjectMultiSelectKey] = useState(0);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const reassignClearSelectionRef = React.useRef<React.Dispatch<React.SetStateAction<RowSelectionState>> | null>(null);

  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const textSourceParam = searchParams.get('textSource') ?? '';

  const subjects = initialSubjectsData?.items ?? [];
  const reassignOptions = useMemo(
    () => subjects.filter(s => s.id !== subjectId),
    [subjects, subjectId],
  );

  const data = useMemo(() => initialConflictData?.items ?? [], [initialConflictData]);
  const totalPages = Math.max(1, initialConflictData?.totalPages ?? 1);
  const totalItems = initialConflictData?.totalItems ?? 0;

  const textSourceById = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of data) {
      m.set(row.id, row.textSource);
    }
    return m;
  }, [data]);

  const subjectMultiSelectOptions = useMemo(
    () => reassignOptions.map(s => ({ value: s.id, label: s.name })),
    [reassignOptions],
  );

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === '') {
          p.delete(k);
        } else {
          p.set(k, v);
        }
      });
      if (!('page' in updates)) {
        p.set('page', '1');
      }
      router.push(`?${p.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (query) {
        p.set('textSource', query);
      } else {
        p.delete('textSource');
      }
      p.set('page', '1');
      router.push(`?${p.toString()}`);
    },
    [router, searchParams],
  );

  // This page keeps the toast: a word that is still in a trainer is reported, not sent to the resolve page.
  const handleDeleteVocab = useCallback(async (id: string) => {
    const result = await deleteVocab(id);
    if (!result.ok) {
      throw new Error(vocabInUseMessage(result.conflict, t));
    }
  }, [t]);

  const bulkDelete = useBulkDelete({
    deleteMutation: async (ids: string[]) => {
      const result = await deleteVocabsBulk(ids);
      return result.ok ? { success: true } : { success: false, error: vocabInUseMessage(result.conflict, t) };
    },
    onSuccess: () => {
      startTransition(() => router.refresh());
    },
    itemName: 'vocabulary',
    itemNamePlural: 'vocabularies',
  });

  const handleBulkReassignTable = useCallback(
    (ids: string[], emptyRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>) => {
      reassignClearSelectionRef.current = emptyRowSelection;
      setReassignIds(ids);
      setBulkTargetSubjectIds([]);
      setPreviewVisibleCount(PREVIEW_PAGE_SIZE);
      setSubjectMultiSelectKey(k => k + 1);
      setReassignOpen(true);
    },
    [],
  );

  const removeReassignId = useCallback((id: string) => {
    reassignClearSelectionRef.current?.((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setReassignIds((prev) => {
      const next = prev.filter(x => x !== id);
      setPreviewVisibleCount(v => (next.length === 0 ? PREVIEW_PAGE_SIZE : Math.min(v, next.length)));
      if (next.length === 0) {
        reassignClearSelectionRef.current?.({});
        reassignClearSelectionRef.current = null;
        setReassignOpen(false);
        setBulkTargetSubjectIds([]);
      }
      return next;
    });
  }, []);

  const confirmBulkReassign = async () => {
    if (bulkTargetSubjectIds.length === 0) {
      toast.error(t('vocabs.toast.selectSubject'));
      return;
    }
    const fetched = await getVocabsByIds(reassignIds);
    if (fetched && typeof fetched === 'object' && 'error' in fetched) {
      toast.error(fetched.error);
      return;
    }
    const vocabs = fetched as TVocab[];
    if (vocabs.length === 0) {
      toast.error(t('vocabs.toast.loadFailed'));
      return;
    }
    try {
      const updates = vocabs.map(v => ({
        id: v.id,
        data: buildVocabUpdateForSubjectReassign(v, subjectId, bulkTargetSubjectIds),
      }));
      await bulkUpdateVocabs(updates);
      toast.success(t('vocabs.toast.reassigned'));
      reassignClearSelectionRef.current?.({});
      reassignClearSelectionRef.current = null;
      setReassignOpen(false);
      setReassignIds([]);
      setBulkTargetSubjectIds([]);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('vocabs.toast.reassignFailed'));
    }
  };

  const handleRowReassign = useCallback(
    async (vocab: TVocab, newSubjectIds: string[]): Promise<boolean> => {
      const ids = newSubjectIds.filter(id => id !== subjectId);
      if (ids.length === 0) {
        toast.error(t('vocabs.toast.rowSelectSubject'));
        return false;
      }
      setRowBusyId(vocab.id);
      try {
        await updateVocab(
          vocab.id,
          buildVocabUpdateForSubjectReassign(vocab, subjectId, ids),
        );
        toast.success(t('vocabs.toast.rowReassigned'));
        startTransition(() => router.refresh());
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('vocabs.toast.rowReassignFailed'));
        return false;
      } finally {
        setRowBusyId(null);
      }
    },
    [subjectId, router, startTransition, t],
  );

  const handleEditNavigate = useCallback(
    (vocab: TVocab) => {
      if (vocab.languageFolderId) {
        const q = new URLSearchParams({
          languageFolderId: vocab.languageFolderId,
          textSource: vocab.textSource,
        });
        router.push(`/vocab-list?${q.toString()}`);
        return;
      }
      toast.message(t('vocabs.toast.openVocabList'), {
        description: t('vocabs.toast.openVocabListDescription'),
      });
      router.push('/vocab-list');
    },
    [router, t],
  );

  const titleSuffix = conflictSubjectName ? ` ${t('vocabs.titleFor', { name: conflictSubjectName })}` : '';

  const columns = useMemo<ColumnDef<TVocab>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('vocabs.columns.select')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label={t('vocabs.columns.selectRow')}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'textSource',
        header: t('vocabs.columns.textSource'),
        cell: ({ row }) => (
          <span
            key={`${row.original.textSource}`}
            className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40 md:max-w-48"
            title={row.original.textSource}
          >
            <span className="block min-w-0 truncate">
              {row.original.textSource}
            </span>
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'textTargets',
        header: t('vocabs.columns.textTargets'),
        cell: ({ row }) => {
          const textTargets = row.original.textTargets;
          if (!textTargets?.length) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {textTargets.map((textTarget, index) => (
                <span
                  key={`${textTarget.textTarget}-${index}`}
                  className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40 md:max-w-48"
                  title={textTarget.textTarget}
                >
                  <span className="block min-w-0 truncate">
                    {textTarget.textTarget}
                  </span>
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'reassign',
        header: t('vocabs.columns.reassign'),
        cell: ({ row }) => (
          <div
            data-no-expand
            role="presentation"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <RowReassignSubjectsPopover
              key={`${row.original.id}-${row.original.updatedAt ?? row.original.createdAt ?? ''}`}
              vocab={row.original}
              options={reassignOptions}
              disabled={reassignOptions.length === 0}
              applying={rowBusyId === row.original.id}
              onApply={(v, ids) => handleRowReassign(v, ids)}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        header: t('vocabs.columns.dateAdded'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatConflictDate(row.original.createdAt, locale)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: 'actions',
        header: t('vocabs.columns.actions'),
        cell: ({ row }) => (
          <DeleteActionButton
            itemId={row.original.id}
            itemName={row.original.textSource}
            onDelete={handleDeleteVocab}
            onSuccess={() => startTransition(() => router.refresh())}
          />
        ),
        enableSorting: false,
      },
    ],
    [reassignOptions, rowBusyId, handleRowReassign, handleEditNavigate, handleDeleteVocab, startTransition, router, t, locale],
  );

  const filterTrigger = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 bg-card/80">
          <Filter size={16} weight="BoldDuotone" className="mr-2" />
          {t('vocabs.filter.button')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('vocabs.filter.sortBy')}</Label>
            <Select
              value={pagination.sortBy}
              onValueChange={v => updateQuery({ sortBy: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">{t('vocabs.filter.sortCreated')}</SelectItem>
                <SelectItem value="updatedAt">{t('vocabs.filter.sortUpdated')}</SelectItem>
                <SelectItem value="textSource">{t('vocabs.filter.sortTextSource')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('vocabs.filter.order')}</Label>
            <Select
              value={pagination.sortOrder}
              onValueChange={v => updateQuery({ sortOrder: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t('vocabs.filter.newestFirst')}</SelectItem>
                <SelectItem value="asc">{t('vocabs.filter.oldestFirst')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className={PAGE_CONTAINER_CLASS}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/subjects">{t('title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('vocabs.breadcrumbConflict')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('vocabs.title')}
              {titleSuffix}
            </h1>
          </div>
          <Button variant="outline" className="shrink-0" asChild>
            <Link href="/subjects">
              <AltArrowLeft size={18} weight="BoldDuotone" className="mr-2" />
              {t('vocabs.backToSubjects')}
            </Link>
          </Button>
        </div>

        {loadFailed && (
          <ErrorState message={t('vocabs.loadError')} />
        )}

        {!loadFailed && (
          <>
            <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10">
              <DangerTriangle className="size-4" />
              <AlertTitle>{t('vocabs.actionRequired')}</AlertTitle>
              <AlertDescription>
                {t('vocabs.alertBody', { count: totalItems })}
              </AlertDescription>
            </Alert>

            <DataTable
              columns={columns}
              data={data}
              searchPlaceholder={t('vocabs.searchPlaceholder')}
              searchValue={textSourceParam}
              onSearchChangeAction={handleSearchChange}
              showSearch
              showPagination
              splitToolbar
              filterTrigger={filterTrigger}
              onBulkDelete={bulkDelete.handleBulkDelete}
              onBulkReassign={handleBulkReassignTable}
              pageSize={pagination.pageSize}
              isLoading={false}
              skeletonRowCount={pagination.pageSize}
              manualPagination
              manualSorting
              manualFiltering
              pageCount={totalPages}
              currentPage={pagination.page}
              totalItems={totalItems}
              onPageChange={handlers.handlePageChange}
              onSortingChange={handlers.handleSort}
              onPageSizeChange={handlers.handlePageSizeChange}
            />

            <BulkDeleteDialog
              open={bulkDelete.bulkDeleteDialogOpen}
              onOpenChange={bulkDelete.setBulkDeleteDialogOpen}
              itemCount={bulkDelete.selectedIds.length}
              itemName="vocabulary"
              itemNamePlural="vocabularies"
              onConfirm={bulkDelete.confirmBulkDelete}
              onCancel={bulkDelete.reset}
            />

            <Dialog
              open={reassignOpen}
              onOpenChange={(open) => {
                setReassignOpen(open);
                if (!open) {
                  reassignClearSelectionRef.current = null;
                  setBulkTargetSubjectIds([]);
                  setPreviewVisibleCount(PREVIEW_PAGE_SIZE);
                }
              }}
            >
              <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('vocabs.bulk.title')}</DialogTitle>
                  <DialogDescription>
                    {t('vocabs.bulk.description', { count: reassignIds.length })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t('vocabs.bulk.targetSubjects')}
                    </Label>
                    <MultiSelect
                      key={subjectMultiSelectKey}
                      options={subjectMultiSelectOptions}
                      defaultValue={[]}
                      onValueChange={setBulkTargetSubjectIds}
                      placeholder={t('vocabs.bulk.choose')}
                      maxCount={5}
                      className="w-full"
                      resetOnDefaultValueChange
                      // ponytail: nested inside a modal Dialog, whose react-remove-scroll
                      // lock blocks wheel events on portaled content. modal popover pushes
                      // its own scroll lock so the list scrolls.
                      modalPopover
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {t('vocabs.bulk.previewTitle')}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {reassignIds.length}
                        {' '}
                        {t('vocabs.bulk.total')}
                      </span>
                    </div>
                    {reassignIds.length === 0
                      ? (
                          <p className="text-sm text-muted-foreground">{t('vocabs.bulk.noneSelected')}</p>
                        )
                      : (
                          <div className="flex flex-wrap gap-2">
                            {reassignIds.slice(0, previewVisibleCount).map(id => (
                              <span
                                key={id}
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary',
                                  !textSourceById.get(id) && 'opacity-70',
                                )}
                              >
                                <span className="max-w-[220px] truncate">{textSourceById.get(id) ?? '…'}</span>
                                <button
                                  type="button"
                                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/15"
                                  onClick={() => removeReassignId(id)}
                                  aria-label={textSourceById.get(id)
                                    ? t('vocabs.bulk.remove', { name: textSourceById.get(id) ?? '' })
                                    : t('vocabs.bulk.removeGeneric')}
                                >
                                  <CloseCircle size={14} weight="BoldDuotone" />
                                </button>
                              </span>
                            ))}
                            {reassignIds.length > previewVisibleCount && (
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                                onClick={() =>
                                  setPreviewVisibleCount(c => c + PREVIEW_PAGE_SIZE)}
                                aria-label={t('vocabs.bulk.showMore', { count: Math.min(PREVIEW_PAGE_SIZE, reassignIds.length - previewVisibleCount) })}
                              >
                                {t('vocabs.bulk.more', { count: reassignIds.length - previewVisibleCount })}
                              </button>
                            )}
                          </div>
                        )}
                  </div>

                  <Alert className="text-warning-950 dark:text-warning-100 [&>svg]:text-warning-700 dark:[&>svg]:text-warning-300 border-warning/40 bg-warning/10 dark:border-warning/30 dark:bg-warning/10">
                    <InfoCircle className="size-4" />
                    <AlertTitle>{t('vocabs.bulk.note')}</AlertTitle>
                    <AlertDescription>
                      {t('vocabs.bulk.noteBody')}
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setReassignOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button
                    type="button"
                    disabled={reassignIds.length === 0 || bulkTargetSubjectIds.length === 0}
                    onClick={() => void confirmBulkReassign()}
                  >
                    {t('vocabs.bulk.confirm')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
