'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { SubjectSectionProps, TCreateSubject, TSubject } from '@/types/subject';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AddCircle, InfoCircle, Reorder } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createSubject, deleteSubject, reorderSubjects, updateSubject } from '@/actions/subjects';
import { SubjectDeleteConflictDialog } from '@/components/settings/SubjectDeleteConflictDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SubjectForm } from '@/components/settings/SubjectForm';
import { SubjectTableRow } from '@/components/settings/SubjectTableRow';
import { SubjectsPagination } from '@/components/settings/SubjectsPagination';
import { SettingsPageShell } from '@/components/settings/SettingsPageShell';

export const SubjectSection: React.FC<SubjectSectionProps> = ({ initialSubjectsData }) => {
  const t = useTranslations('subjects');
  const tErrors = useTranslations('errors');
  const subjects = initialSubjectsData?.items || [];
  const isLoading = false;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TSubject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    subjectId: string;
    vocabularyCount?: number;
  }>({ open: false, subjectId: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.order - b.order),
    [subjects],
  );

  const paginatedSubjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedSubjects.slice(start, start + pageSize);
  }, [sortedSubjects, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedSubjects.length / pageSize));
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleCreate = async (data: TCreateSubject) => {
    try {
      setIsSubmitting(true);
      await createSubject(data);
      setPage(1);
      setIsCreateDialogOpen(false);
      toast.success(t('toast.created'));
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(tErrors('createSubject'));
      console.error('Create subject error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: TCreateSubject) => {
    if (!editingSubject) {
      return;
    }
    try {
      setIsSubmitting(true);
      await updateSubject(editingSubject.id, {
        name: data.name,
        order: editingSubject.order,
      });
      setEditingSubject(null);
      toast.success(t('toast.updated'));
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(tErrors('updateSubject'));
      console.error('Update subject error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSubject(id);
      if (!result.ok && result.code === 'CONFLICT') {
        setConflictDialog({
          open: true,
          subjectId: id,
          vocabularyCount: result.vocabularyCount,
        });
        return;
      }
      toast.success(t('toast.deleted'));
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(tErrors('deleteSubject'));
      console.error('Delete subject error:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) {
      return;
    }

    const oldIndex = sortedSubjects.findIndex(item => item.id === String(active.id));
    const newIndex = sortedSubjects.findIndex(item => item.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(sortedSubjects, oldIndex, newIndex);
    try {
      await reorderSubjects(
        newOrder.map((s, i) => ({ id: s.id, order: i + 1 })),
      );
      toast.success(t('toast.reordered'));
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(tErrors('reorderSubjects'));
      console.error('Reorder subjects error:', error);
    }
  };

  const headerAction = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          {t('list.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createNew')}</DialogTitle>
        </DialogHeader>
        <SubjectForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <SettingsPageShell
        title={t('title')}
        description={t('description')}
      >
        <Card className="overflow-hidden border-0 bg-card/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4" />
                  <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4" />
                  <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4" />
                  <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4" />
                  <th className="bg-muted/30 px-3 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4" />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-3 py-3 sm:px-6 sm:py-4" colSpan={5}>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-1/2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </SettingsPageShell>
    );
  }

  return (
    <SettingsPageShell
      title={t('title')}
      description={t('description')}
      headerAction={headerAction}
    >
      <div className="space-y-6">
        {sortedSubjects.length === 0
          ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <h4 className="mb-2 text-lg font-medium text-foreground">
                    {t('list.emptyTitle')}
                  </h4>
                  <p className="mb-4 text-muted-foreground">
                    {t('list.emptyBody')}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
                    {t('list.addNew')}
                  </Button>
                </CardContent>
              </Card>
            )
          : (
              <>
                <Card className="overflow-hidden border-0 bg-card/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                  <CardContent className="p-0">
                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">
                              {t('list.columnReorder')}
                            </th>
                            <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">
                              {t('list.columnDetails')}
                            </th>
                            <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">
                              {t('list.columnWordCount')}
                            </th>
                            <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">
                              {t('list.columnCreated')}
                            </th>
                            <th className="bg-muted/30 px-3 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">
                              {t('list.columnActions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={paginatedSubjects.map(s => s.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {paginatedSubjects.map((subject, index) => (
                                <SubjectTableRow
                                  key={subject.id}
                                  subject={subject}
                                  index={(page - 1) * pageSize + index}
                                  onEdit={setEditingSubject}
                                  onDelete={handleDelete}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <SubjectsPagination
                  currentPage={page}
                  totalItems={sortedSubjects.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                />

                <Alert className="border-border bg-accent/40">
                  <InfoCircle className="size-5 text-primary" />
                  <AlertDescription>
                    {t('list.dragHintBefore')}
                    {' '}
                    <span className="inline-flex rounded p-0.5 text-muted-foreground" aria-hidden>
                      <Reorder className="translate-y-1" size={16} weight="BoldDuotone" />
                    </span>
                    {' '}
                    {t('list.dragHintAfter')}
                  </AlertDescription>
                </Alert>
              </>
            )}
      </div>

      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editSubject')}</DialogTitle>
          </DialogHeader>
          <SubjectForm
            subject={editingSubject}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSubject(null)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <SubjectDeleteConflictDialog
        open={conflictDialog.open}
        onOpenChange={open => setConflictDialog(prev => ({ ...prev, open }))}
        subjectId={conflictDialog.subjectId}
        vocabularyCount={conflictDialog.vocabularyCount}
      />
    </SettingsPageShell>
  );
};
