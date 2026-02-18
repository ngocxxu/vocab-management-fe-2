'use client';

import type { SubjectTableRowProps } from '@/types/subject';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pen, Reorder, TrashBin2 } from '@solar-icons/react/ssr';
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCreatedDate, getSubjectColor, getSubjectInitials } from '@/utils/subject';

export const SubjectTableRow: React.FC<SubjectTableRowProps> = ({ subject, index, onEdit, onDelete }) => {
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
