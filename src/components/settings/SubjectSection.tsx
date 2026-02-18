'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { SubjectSectionProps, TCreateSubject, TSubject } from '@/types/subject';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AddCircle, InfoCircle, Reorder } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createSubject, deleteSubject, reorderSubjects, updateSubject } from '@/actions/subjects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SubjectForm } from '@/components/settings/SubjectForm';
import { SubjectTableRow } from '@/components/settings/SubjectTableRow';
import { SubjectsPagination } from '@/components/settings/SubjectsPagination';
import { SettingsPageShell } from '@/components/settings/SettingsPageShell';

const PAGE_SIZE = 10;

export const SubjectSection: React.FC<SubjectSectionProps> = ({ initialSubjectsData }) => {
  const subjects = initialSubjectsData?.items || [];
  const isLoading = false;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TSubject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
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
    const start = (page - 1) * PAGE_SIZE;
    return sortedSubjects.slice(start, start + PAGE_SIZE);
  }, [sortedSubjects, page]);

  const totalPages = Math.max(1, Math.ceil(sortedSubjects.length / PAGE_SIZE));
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleCreate = async (data: TCreateSubject) => {
    try {
      setIsSubmitting(true);
      await createSubject(data);
      setIsCreateDialogOpen(false);
      toast.success('Subject created successfully');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to create subject');
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
      toast.success('Subject updated successfully');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to update subject');
      console.error('Update subject error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id);
      toast.success('Subject deleted successfully');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to delete subject');
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
      toast.success('Subjects reordered successfully');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to reorder subjects');
      console.error('Reorder subjects error:', error);
    }
  };

  const headerAction = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          Add New Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
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
        title="Subjects"
        description="Manage and reorder your learning categories to personalize your vocabulary study path."
      >
        <Card className="overflow-hidden border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:bg-slate-800/80">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400" />
                  <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400" />
                  <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400" />
                  <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400" />
                  <th className="bg-slate-50/50 px-3 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400" />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
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
      title="Subjects"
      description="Manage and reorder your learning categories to personalize your vocabulary study path."
      headerAction={headerAction}
    >
      <div className="space-y-6">
        {sortedSubjects.length === 0
          ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <h4 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                    No subjects yet
                  </h4>
                  <p className="mb-4 text-slate-600 dark:text-slate-400">
                    Create your first subject to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
                    Add New Subject
                  </Button>
                </CardContent>
              </Card>
            )
          : (
              <>
                <Card className="overflow-hidden border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:bg-slate-800/80">
                  <CardContent className="p-0">
                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400">
                              Reorder
                            </th>
                            <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400">
                              Subject Details
                            </th>
                            <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400">
                              Word Count
                            </th>
                            <th className="bg-slate-50/50 px-3 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400">
                              Created Date
                            </th>
                            <th className="bg-slate-50/50 px-3 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase sm:px-6 sm:py-4 dark:bg-slate-800/50 dark:text-slate-400">
                              Actions
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
                                  index={(page - 1) * PAGE_SIZE + index}
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
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />

                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
                  <InfoCircle className="size-5 text-blue-600 dark:text-blue-400" />
                  <AlertDescription>
                    You can drag the
                    {' '}
                    <span className="inline-flex rounded p-0.5 text-slate-500 dark:text-slate-400" aria-hidden>
                      <Reorder className="translate-y-1" size={16} weight="BoldDuotone" />
                    </span>
                    {' '}
                    handle to reorder how subjects appear in your dashboard.
                  </AlertDescription>
                </Alert>
              </>
            )}
      </div>

      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <SubjectForm
            subject={editingSubject}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSubject(null)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </SettingsPageShell>
  );
};
