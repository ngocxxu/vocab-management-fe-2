'use client';

import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TVocabConflictListResponse } from '@/types/vocab-conflict';
import { AltArrowLeft, CloseCircle, DangerTriangle, Filter, InfoCircle } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { bulkUpdateVocabs, deleteVocab, deleteVocabsBulk, getVocabsByIds, updateVocab } from '@/actions/vocabs';
import { cn } from '@/libs/utils';
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

function formatConflictDate(iso?: string): string {
  if (!iso) {
    return '—';
  }
  try {
    return new Date(iso).toLocaleDateString(undefined, {
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

  const bulkDelete = useBulkDelete({
    deleteMutation: async (ids: string[]) => {
      await deleteVocabsBulk(ids);
      return { success: true };
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
      toast.error('Select at least one subject to reassign to.');
      return;
    }
    const fetched = await getVocabsByIds(reassignIds);
    if (fetched && typeof fetched === 'object' && 'error' in fetched) {
      toast.error(fetched.error);
      return;
    }
    const vocabs = fetched as TVocab[];
    if (vocabs.length === 0) {
      toast.error('Could not load selected vocabularies.');
      return;
    }
    try {
      const updates = vocabs.map(v => ({
        id: v.id,
        data: buildVocabUpdateForSubjectReassign(v, subjectId, bulkTargetSubjectIds),
      }));
      await bulkUpdateVocabs(updates);
      toast.success('Vocabularies reassigned successfully.');
      reassignClearSelectionRef.current?.({});
      reassignClearSelectionRef.current = null;
      setReassignOpen(false);
      setReassignIds([]);
      setBulkTargetSubjectIds([]);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reassign vocabularies.');
    }
  };

  const handleRowReassign = useCallback(
    async (vocab: TVocab, newSubjectIds: string[]): Promise<boolean> => {
      const ids = newSubjectIds.filter(id => id !== subjectId);
      if (ids.length === 0) {
        toast.error('Select at least one subject.');
        return false;
      }
      setRowBusyId(vocab.id);
      try {
        await updateVocab(
          vocab.id,
          buildVocabUpdateForSubjectReassign(vocab, subjectId, ids),
        );
        toast.success('Vocabulary reassigned.');
        startTransition(() => router.refresh());
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to reassign.');
        return false;
      } finally {
        setRowBusyId(null);
      }
    },
    [subjectId, router, startTransition],
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
      toast.message('Open Vocab List', {
        description: 'Find this word from the main list to edit full details.',
      });
      router.push('/vocab-list');
    },
    [router],
  );

  const titleSuffix = conflictSubjectName ? ` for ${conflictSubjectName}` : '';

  const columns = useMemo<ColumnDef<TVocab>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'textSource',
        header: 'Text Source',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.textSource}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'textTargets',
        header: 'Text Targets',
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
                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {textTarget.textTarget}
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'reassign',
        header: 'Reassign to new subject',
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
        header: 'Date added',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatConflictDate(row.original.createdAt)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DeleteActionButton
            itemId={row.original.id}
            itemName={row.original.textSource}
            onDelete={deleteVocab}
            onSuccess={() => startTransition(() => router.refresh())}
          />
        ),
        enableSorting: false,
      },
    ],
    [reassignOptions, rowBusyId, handleRowReassign, handleEditNavigate, startTransition],
  );

  const filterTrigger = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-border bg-card/80">
          <Filter size={16} weight="BoldDuotone" className="mr-2" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={pagination.sortBy}
              onValueChange={v => updateQuery({ sortBy: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created date</SelectItem>
                <SelectItem value="updatedAt">Updated date</SelectItem>
                <SelectItem value="textSource">Vocabulary name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Select
              value={pagination.sortOrder}
              onValueChange={v => updateQuery({ sortOrder: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/subjects">Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Conflict Vocabularies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Vocabularies
              {titleSuffix}
            </h1>
          </div>
          <Button variant="outline" className="shrink-0 border-border" asChild>
            <Link href="/subjects">
              <AltArrowLeft size={18} weight="BoldDuotone" className="mr-2" />
              Back to Subjects
            </Link>
          </Button>
        </div>

        {loadFailed && (
          <ErrorState message="Could not load conflicting vocabularies. Try again or return to subjects." />
        )}

        {!loadFailed && (
          <>
            <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10">
              <DangerTriangle className="size-4" />
              <AlertTitle>Action required</AlertTitle>
              <AlertDescription>
                These
                {' '}
                {totalItems}
                {' '}
                vocabularies are preventing the deletion of this subject. Reassign or delete them to proceed with
                the subject removal.
              </AlertDescription>
            </Alert>

            <DataTable
              columns={columns}
              data={data}
              searchPlaceholder="Search vocabularies..."
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
                  <DialogTitle>Bulk Reassign Subject</DialogTitle>
                  <DialogDescription>
                    Select new subjects for the
                    {' '}
                    {reassignIds.length}
                    {' '}
                    selected vocabularies. The conflicting subject will be removed and the chosen subjects added on all text targets.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Target subjects
                    </Label>
                    <MultiSelect
                      key={subjectMultiSelectKey}
                      options={subjectMultiSelectOptions}
                      defaultValue={[]}
                      onValueChange={setBulkTargetSubjectIds}
                      placeholder="Choose subjects..."
                      maxCount={5}
                      className="w-full"
                      resetOnDefaultValueChange
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Selected items preview
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {reassignIds.length}
                        {' '}
                        total
                      </span>
                    </div>
                    {reassignIds.length === 0
                      ? (
                          <p className="text-sm text-muted-foreground">No items selected.</p>
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
                                  aria-label={textSourceById.get(id) ? `Remove ${textSourceById.get(id)}` : 'Remove selected vocabulary'}
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
                                aria-label={`Show ${Math.min(PREVIEW_PAGE_SIZE, reassignIds.length - previewVisibleCount)} more selected items`}
                              >
                                +
                                {reassignIds.length - previewVisibleCount}
                                {' '}
                                more
                              </button>
                            )}
                          </div>
                        )}
                  </div>

                  <Alert className="text-warning-950 dark:text-warning-100 [&>svg]:text-warning-700 dark:[&>svg]:text-warning-300 border-warning/40 bg-warning/10 dark:border-warning/30 dark:bg-warning/10">
                    <InfoCircle className="size-4" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      Reassigning these vocabularies resolves subject-related conflicts for this deletion flow. Changes are persisted on the server.
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setReassignOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={reassignIds.length === 0 || bulkTargetSubjectIds.length === 0}
                    onClick={() => void confirmBulkReassign()}
                  >
                    Confirm reassign
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
