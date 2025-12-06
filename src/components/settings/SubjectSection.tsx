'use client';

import type { TCreateSubject, TSubject } from '@/types/subject';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { subjectMutations, useSubjects } from '@/hooks/useSubjects';

type SubjectItemProps = {
  subject: TSubject;
  onEdit: (subject: TSubject) => void;
  onDelete: (id: string) => void;
};

const SubjectItem: React.FC<SubjectItemProps> = ({ subject, onEdit, onDelete }) => {
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
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 hover:bg-slate-100 active:cursor-grabbing dark:hover:bg-slate-700"
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{subject.name}</h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Created:
                {' '}
                {new Date(subject.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subject)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "
                  {subject.name}
                  "? This action cannot be undone.
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
      </CardContent>
    </Card>
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
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : subject ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export const SubjectSection: React.FC = () => {
  const { subjects, isLoading, mutate } = useSubjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TSubject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleCreate = async (data: TCreateSubject) => {
    try {
      setIsSubmitting(true);
      await subjectMutations.create(data);
      await mutate();
      setIsCreateDialogOpen(false);
      toast.success('Subject created successfully');
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
      // Include the current order when updating
      await subjectMutations.update(editingSubject.id, {
        name: data.name,
        order: editingSubject.order,
      });
      await mutate();
      setEditingSubject(null);
      toast.success('Subject updated successfully');
    } catch (error) {
      toast.error('Failed to update subject');
      console.error('Update subject error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await subjectMutations.delete(id);
      await mutate();
      toast.success('Subject deleted successfully');
    } catch (error) {
      toast.error('Failed to delete subject');
      console.error('Delete subject error:', error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = subjects.findIndex(item => item.id === active.id);
      const newIndex = subjects.findIndex(item => item.id === over.id);

      const newOrder = arrayMove(subjects, oldIndex, newIndex);

      // Note: Optimistic update not supported with new mutate, will refetch after reorder

      try {
        // Update order on server
        const subjectsWithOrder = newOrder.map((subject, index) => ({
          id: subject.id,
          order: index + 1,
        }));
        await subjectMutations.reorder(subjectsWithOrder);
        await mutate();
        toast.success('Subjects reordered successfully');
      } catch (error) {
        // Revert on error
        await mutate();
        toast.error('Failed to reorder subjects');
        console.error('Reorder subjects error:', error);
      }
    }
  };

  const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subjects</h3>
        </div>
        <div className="space-y-2">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subjects</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your subjects and their order
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
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
      </div>

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
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>
          )
        : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedSubjects.map(subject => subject.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedSubjects.map(subject => (
                    <SubjectItem
                      key={subject.id}
                      subject={subject}
                      onEdit={setEditingSubject}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

      {/* Edit Dialog */}
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
    </div>
  );
};
