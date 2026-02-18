'use client';

import { AddCircle } from '@solar-icons/react/ssr';
import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';

import type { LibraryHeaderProps } from '@/types/language-folder';

const LibraryHeader: React.FC<LibraryHeaderProps> = memo(({
  onCreateFolder,
}) => {
  const handleCreateFolder = useCallback(() => {
    onCreateFolder();
  }, [onCreateFolder]);
  return (
    <div className="flex flex-col items-start justify-between gap-4 text-center sm:flex-row sm:items-center sm:gap-0">
      <div className="flex items-center justify-center space-x-3">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Your Library
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your vocabulary collections across different languages. Track your progress and master new words.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full items-center justify-end space-x-4 sm:w-auto">
        <Button
          onClick={handleCreateFolder}
          className="h-10 w-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:opacity-90 hover:shadow-xl sm:w-auto"
        >
          <AddCircle size={20} weight="BoldDuotone" className="mr-2" />
          <span className="hidden sm:inline">Create New Folder</span>
          <span className="sm:hidden">Create Folder</span>
        </Button>
      </div>
    </div>
  );
});

LibraryHeader.displayName = 'LibraryHeader';

export default LibraryHeader;
