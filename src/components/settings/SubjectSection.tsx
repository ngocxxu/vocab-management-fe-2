'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { TCreateSubject, TSubject, TSubjectResponse } from '@/types/subject';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AddCircle,
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
  CloseCircle,
  InfoCircle,
  Pen,
  Reorder,
  TrashBin2,
} from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createSubject, deleteSubject, reorderSubjects, updateSubject } from '@/actions/subjects';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsPageShell } from '@/components/settings/SettingsPageShell';

const SUBJECT_COLORS = [
  'bg-sky-200 text-sky-800 dark:bg-sky-600 dark:text-sky-100',
  'bg-emerald-200 text-emerald-800 dark:bg-emerald-600 dark:text-emerald-100',
  'bg-amber-200 text-amber-800 dark:bg-amber-600 dark:text-amber-100',
  'bg-violet-200 text-violet-800 dark:bg-violet-600 dark:text-violet-100',
  'bg-rose-200 text-rose-800 dark:bg-rose-600 dark:text-rose-100',
  'bg-cyan-200 text-cyan-800 dark:bg-cyan-600 dark:text-cyan-100',
];

function getSubjectInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts[1]?.charAt(0) ?? '';
    const combined = (a + b).toUpperCase().slice(0, 2) ?? '';
    return combined || '??';
  }
  const raw = name.trim().slice(0, 2).toUpperCase();
  return `${raw ?? '??'}`;
}

function getSubjectColor(index: number): string {
  const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  return color ?? SUBJECT_COLORS[0] ?? '';
}

function formatCreatedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PAGE_SIZE = 10;

type SubjectTableRowProps = {
  subject: TSubject;
  index: number;
  onEdit: (subject: TSubject) => void;
  onDelete: (id: string) => void;
};

const SubjectTableRow: React.FC<SubjectTableRowProps> = ({ subject, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subject.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 bg-white transition-colors hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div
          {...attributes}
          {...listeners}
          className="inline-flex cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="Drag to reorder"
        >
          <Reorder size={20} weight="BoldDuotone" />
        </div>
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getSubjectColor(index)}`}
          >
            {getSubjectInitials(subject.name)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {subject.name}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {null}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <Badge variant="secondary" className="font-normal">
          —
        </Badge>
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 sm:px-6 sm:py-4 dark:text-slate-300">
        {formatCreatedDate(subject.createdAt)}
      </td>
      <td className="px-3 py-3 text-right sm:px-6 sm:py-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subject)}
            className="h-8 w-8 p-0"
            aria-label="Edit subject"
          >
            <Pen size={16} weight="BoldDuotone" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                aria-label="Delete subject"
              >
                <TrashBin2 size={16} weight="BoldDuotone" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;
                  {subject.name}
                  &quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(subject.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
};

type SubjectFormProps = {
  subject?: TSubject | null;
  onSubmit: (data: TCreateSubject) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
};

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Subject Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter subject name"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <CloseCircle size={16} weight="BoldDuotone" className="mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <CheckCircle size={16} weight="BoldDuotone" className="mr-2" />
          {isLoading ? 'Saving...' : subject ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

type SubjectsPaginationProps = Readonly<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}>;

function SubjectsPagination({ currentPage, totalItems, pageSize, onPageChange }: SubjectsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const showing = totalItems === 0 ? 0 : end - start + 1;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing
        {' '}
        {showing}
        {' '}
        of
        {' '}
        {totalItems}
        {' '}
        subjects
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 gap-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <AltArrowLeft size={16} weight="BoldDuotone" />
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 rounded-full p-0 text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 gap-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <AltArrowRight size={16} weight="BoldDuotone" />
        </Button>
      </div>
    </div>
  );
}

type SubjectSectionProps = {
  initialSubjectsData?: TSubjectResponse;
};

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
                  <AlertDescription className="flex flex-wrap items-center gap-1.5 pl-7">
                    You can drag the
                    {' '}
                    <span className="inline-flex rounded p-0.5 text-slate-500 dark:text-slate-400" aria-hidden>
                      <Reorder size={16} weight="BoldDuotone" />
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
