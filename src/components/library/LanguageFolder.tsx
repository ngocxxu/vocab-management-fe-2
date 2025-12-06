'use client';

import { Edit, Folder, MoreVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { deleteLanguageFolder } from '@/actions/language-folders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EditFolderDialog from './EditFolderDialog';

export type TLanguageFolder = {
  id: string;
  name: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  folderColor: string;
};

type LanguageFolderProps = {
  folder: TLanguageFolder;
  onFolderClick: (folder: TLanguageFolder) => void;
  onFolderUpdated?: () => void;
  onFolderDeleted?: () => void;
};

const LanguageFolder = ({ folder, onFolderClick, onFolderUpdated, onFolderDeleted }: LanguageFolderProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLanguageFolder(folder.id);
      toast.success('Language folder deleted successfully!');
      onFolderDeleted?.();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting language folder:', error);
      toast.error('Failed to delete language folder. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <div
        className="group cursor-pointer border-b border-slate-100 bg-white px-6 py-4 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
        onClick={() => onFolderClick(folder)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onFolderClick(folder);
          }
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Icon Column */}
          <div className="flex w-12 items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm" style={{ backgroundColor: folder.folderColor }}>
              <Folder className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Name Column */}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {folder.name}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {folder.sourceLanguageCode.toUpperCase()}
              {' '}
              →
              {' '}
              {folder.targetLanguageCode.toUpperCase()}
            </div>
          </div>

          {/* Last Modified Column */}
          <div className="w-22 text-sm text-slate-600 dark:text-slate-400">
            {new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </div>

          {/* Options Column */}
          <div className="flex w-8 items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  variant="ghost"
                  className="rounded p-1 text-slate-400 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Folder'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Language Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {folder.name}
              &quot;? This action cannot be undone.
              All vocabulary items in this folder will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Folder'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <EditFolderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        folder={folder}
        onFolderUpdated={onFolderUpdated}
      />
    </>
  );
};

export default LanguageFolder;
