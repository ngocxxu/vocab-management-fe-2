'use client';

import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TVocabConflictListResponse } from '@/types/vocab-conflict';
import { AltArrowLeft, DangerTriangle, Filter } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteVocab, deleteVocabsBulk, getVocabsByIds, updateVocab } from '@/actions/vocabs';
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
  const [bulkTargetSubjectId, setBulkTargetSubjectId] = useState('');
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
      setBulkTargetSubjectId('');
      setReassignOpen(true);
    },
    [],
  );

  const confirmBulkReassign = async () => {
    if (!bulkTargetSubjectId) {
      toast.error('Select a subject to reassign to.');
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
    const results = await Promise.allSettled(
      vocabs.map(v =>
        updateVocab(v.id, buildVocabUpdateForSubjectReassign(v, subjectId, bulkTargetSubjectId)),
      ),
    );
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      toast.error(`${failed} of ${vocabs.length} failed to update.`);
    } else {
      toast.success('Vocabularies reassigned successfully.');
    }
    reassignClearSelectionRef.current?.({});
    reassignClearSelectionRef.current = null;
    setReassignOpen(false);
    setReassignIds([]);
    setBulkTargetSubjectId('');
    startTransition(() => router.refresh());
  };

  const handleRowReassign = useCallback(
    async (vocab: TVocab, newSubjectId: string) => {
      if (!newSubjectId || newSubjectId === subjectId) {
        return;
      }
      setRowBusyId(vocab.id);
      try {
        await updateVocab(
          vocab.id,
          buildVocabUpdateForSubjectReassign(vocab, subjectId, newSubjectId),
        );
        toast.success('Vocabulary reassigned.');
        startTransition(() => router.refresh());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to reassign.');
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
          <div data-no-expand role="button" tabIndex={0} onClick={e => e.stopPropagation()} onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
            <Select
              key={row.original.id}
              disabled={rowBusyId === row.original.id || reassignOptions.length === 0}
              onValueChange={v => void handleRowReassign(row.original, v)}
            >
              <SelectTrigger size="sm" className="h-8 w-[min(100%,220px)]" aria-label="Reassign subject">
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {reassignOptions.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                }
              }}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk reassign</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Choose a subject for
                  {' '}
                  {reassignIds.length}
                  {' '}
                  selected vocabularies. The conflicting subject will be replaced for all text targets.
                </p>
                <div className="space-y-2 py-2">
                  <Label>New subject</Label>
                  <Select value={bulkTargetSubjectId} onValueChange={setBulkTargetSubjectId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {reassignOptions.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setReassignOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => void confirmBulkReassign()}>
                    Apply
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
