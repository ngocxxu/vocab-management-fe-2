'use client';

import { Edit, Folder, MoreVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { languageFolderMutations } from '@/hooks/useLanguageFolders';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export type TLanguageFolder = {
  id: string;
  name: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  color: string;
};

type LanguageFolderProps = {
  folder: TLanguageFolder;
  onFolderClick: (folder: TLanguageFolder) => void;
  onFolderUpdated?: () => void;
  onFolderDeleted?: () => void;
};

const LanguageFolder = ({ folder, onFolderClick, onFolderDeleted }: LanguageFolderProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    // TODO: Implement edit functionality with a dialog
    toast.info('Edit functionality coming soon!');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await languageFolderMutations.delete(folder.id);
      toast.success('Language folder deleted successfully!');
      onFolderDeleted?.();
    } catch (error) {
      console.error('Error deleting language folder:', error);
      toast.error('Failed to delete language folder. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
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
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${folder.color} shadow-sm`}>
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
                  handleDelete();
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
  );
};

export default LanguageFolder;
