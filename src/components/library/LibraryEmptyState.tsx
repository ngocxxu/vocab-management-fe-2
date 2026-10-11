'use client';
import { AddCircle, Folder } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/ui/button';

import type { LibraryEmptyStateProps } from '@/types/language-folder';

const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ searchQuery, onCreateFolder }) => {
  const t = useTranslations('library.empty');

  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Folder size={48} weight="BoldDuotone" className="text-muted-foreground" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-foreground">
        {searchQuery ? t('noResultsTitle') : t('firstTitle')}
      </h3>
      <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
        {searchQuery ? t('noResultsHint') : t('firstHint')}
      </p>
      {!searchQuery && (
        <Button
          onClick={onCreateFolder}
          className="mt-6 bg-primary text-primary-foreground hover:opacity-90"
        >
          <AddCircle size={20} weight="BoldDuotone" className="mr-2" />
          {t('firstButton')}
        </Button>
      )}
    </div>
  );
};

export default LibraryEmptyState;
