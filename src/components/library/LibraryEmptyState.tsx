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
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Folder className="h-12 w-12 text-muted-foreground" />
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
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Folder
        </Button>
      )}
    </div>
  );
};

export default LibraryEmptyState;
