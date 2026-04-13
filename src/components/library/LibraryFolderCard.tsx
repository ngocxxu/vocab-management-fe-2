'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/libs/utils';
import type { LibraryFolderCardProps } from '@/types/language-folder';
import { Folder, MenuDots, NotebookMinimalistic, Pen, TrashBin2 } from '@solar-icons/react/ssr';
import React, { useCallback, useState } from 'react';
import { formatEditedAgo } from './utils';

function clampInt(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}

function masteryTextClass(percent: number): string {
  if (percent >= 67) {
    return 'text-success';
  }
  if (percent >= 34) {
    return 'text-primary';
  }
  return 'text-warning';
}

function masteryFillClass(percent: number): string {
  if (percent >= 67) {
    return 'bg-success';
  }
  if (percent >= 34) {
    return 'bg-primary';
  }
  return 'bg-warning';
}

const LibraryFolderCard: React.FC<LibraryFolderCardProps> = ({
  folder,
  languageNameByCode,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = useCallback(() => {
    onClick(folder);
  }, [folder, onClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(folder);
    },
    [folder, onEdit],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    await onDelete(folder.id);
    setShowDeleteDialog(false);
  }, [folder.id, onDelete]);

  const vocabCount = folder.vocabCount ?? 0;
  const wordsLabel = `${vocabCount} word${vocabCount === 1 ? '' : 's'}`;

  const masteryScore = folder.averageMastery ?? 0;
  const masteryPercent = clampInt(masteryScore * 10, 0, 100);

  const textClass = masteryTextClass(masteryPercent);
  const fillClass = masteryFillClass(masteryPercent);

  const sourceName
    = languageNameByCode?.[folder.sourceLanguageCode.toLowerCase()]
      ?? folder.sourceLanguageCode.toUpperCase();

  const targetName
    = languageNameByCode?.[folder.targetLanguageCode.toLowerCase()]
      ?? folder.targetLanguageCode.toUpperCase();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 shadow-sm',
          'transition-colors hover:border-primary/30 hover:shadow-md',
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: folder.folderColor }}
            >
              <Folder size={24} weight="BoldDuotone" className="text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold text-foreground">
                {folder.name}
              </h3>
              <p className="mt-0.5 text-sm font-normal text-muted-foreground">
                Edited
                {' '}
                {formatEditedAgo(folder.updatedAt)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={e => e.stopPropagation()}
              >
                <MenuDots size={18} weight="BoldDuotone" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleEdit}>
                <Pen size={16} weight="BoldDuotone" className="mr-2" />
                Edit Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <TrashBin2 size={16} weight="BoldDuotone" className="mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center gap-1 text-base font-normal text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <NotebookMinimalistic size={16} weight="BoldDuotone" className="shrink-0 text-muted-foreground" />
            {wordsLabel}
          </span>
          <span className="mx-1.5 h-1 w-1 rounded-full bg-muted-foreground/30"></span>
          <span className="text-xs font-medium">
            {sourceName}
            {' '}
            →
            {' '}
            {targetName}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Mastery
            </span>
            <span className={cn('text-base font-semibold', textClass)}>
              {masteryPercent}
              %
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', fillClass)}
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={e => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Language Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {folder.name}
              ? This
              action cannot be undone. All vocabulary items in this folder will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LibraryFolderCard;
