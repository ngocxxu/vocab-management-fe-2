'use client';

import { AddCircle } from '@solar-icons/react/ssr';
import React, { useCallback } from 'react';
import { cn } from '@/libs/utils';

type CreateFolderCardProps = {
  onCreateFolder: () => void;
};

const CreateFolderCard: React.FC<CreateFolderCardProps> = ({ onCreateFolder }) => {
  const handleClick = useCallback(() => {
    onCreateFolder();
  }, [onCreateFolder]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-8',
        'transition-colors hover:border-primary/50 hover:bg-accent/30',
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <AddCircle size={28} weight="BoldDuotone" className="text-primary" />
      </div>
      <h3 className="mt-4 text-base font-bold text-foreground">
        Create New Folder
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Start a new language journey
      </p>
    </div>
  );
};

export default CreateFolderCard;
