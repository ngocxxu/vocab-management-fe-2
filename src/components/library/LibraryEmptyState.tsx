'use client';
import { AddCircle, Folder } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';

import type { LibraryEmptyStateProps } from '@/types/language-folder';

const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ searchQuery, onCreateFolder }) => {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Folder size={48} weight="BoldDuotone" className="text-muted-foreground" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">
        {searchQuery ? 'No language folders found' : 'Create Your First Language Folder'}
      </h3>
      <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
        {searchQuery
          ? 'Try adjusting your search terms or check your spelling'
          : 'Start by creating a language folder to organize your vocabulary. Choose your source and target languages, then add your first words!'}
      </p>
      {!searchQuery && (
        <Button
          onClick={onCreateFolder}
          className="mt-6 bg-primary text-primary-foreground hover:opacity-90"
        >
          <AddCircle size={20} weight="BoldDuotone" className="mr-2" />
          Create Your First Folder
        </Button>
      )}
    </div>
  );
};

export default LibraryEmptyState;
