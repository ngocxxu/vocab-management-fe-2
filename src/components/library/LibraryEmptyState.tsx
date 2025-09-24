'use client';
import { Folder, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

type LibraryEmptyStateProps = {
  searchQuery: string;
  onCreateFolder: () => void;
};

const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ searchQuery, onCreateFolder }) => {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        <Folder className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
        {searchQuery ? 'No language folders found' : 'Create Your First Language Folder'}
      </h3>
      <p className="mx-auto max-w-md leading-relaxed text-slate-600 dark:text-slate-400">
        {searchQuery
          ? 'Try adjusting your search terms or check your spelling'
          : 'Start by creating a language folder to organize your vocabulary. Choose your source and target languages, then add your first words!'}
      </p>
      {!searchQuery && (
        <Button
          onClick={onCreateFolder}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Folder
        </Button>
      )}
    </div>
  );
};

export default LibraryEmptyState;
