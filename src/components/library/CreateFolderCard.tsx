'use client';

import { AddCircle, Lock } from '@solar-icons/react/ssr';
import React, { useCallback, useState } from 'react';
import { cn } from '@/libs/utils';
import { UpsellModal } from '@/components/premium';

import type { CreateFolderCardProps } from '@/types/language-folder';

const CreateFolderCard: React.FC<CreateFolderCardProps> = ({ onCreateFolder, canCreateFolder = true }) => {
  const [upsellOpen, setUpsellOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (canCreateFolder) {
      onCreateFolder();
    } else {
      setUpsellOpen(true);
    }
  }, [canCreateFolder, onCreateFolder]);

  return (
    <>
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
          {canCreateFolder
            ? (
                <AddCircle size={28} weight="BoldDuotone" className="text-primary" />
              )
            : (
                <Lock size={28} weight="BoldDuotone" className="text-muted-foreground" />
              )}
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">
          Create New Folder
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {canCreateFolder ? 'Start a new language journey' : 'Upgrade to create more folders'}
        </p>
      </div>
      <UpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        featureName="Create language folder"
        description="Create more language folders on the Member plan. Upgrade to unlock unlimited folders."
      />
    </>
  );
};

export default CreateFolderCard;
