'use client';

import { AddCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumFeatureGate } from '@/components/premium';

import type { LibraryHeaderProps } from '@/types/language-folder';

const createFolderButtonClass = 'h-10 w-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:opacity-90 hover:shadow-xl sm:w-auto';

const LibraryHeader: React.FC<LibraryHeaderProps> = memo(({
  onCreateFolder,
  userRole,
  canCreateFolder = true,
}) => {
  const t = useTranslations('library.header');
  const handleCreateFolder = useCallback(() => {
    onCreateFolder();
  }, [onCreateFolder]);
  const createFolderButtonContent = (
    <>
      <AddCircle size={20} weight="BoldDuotone" className="mr-2" />
      <span className="hidden sm:inline">{t('createNew')}</span>
      <span className="sm:hidden">{t('createShort')}</span>
    </>
  );
  return (
    <div className="flex flex-col items-start justify-between gap-4 text-center sm:flex-row sm:items-center sm:gap-0">
      <div className="flex items-center justify-center space-x-3">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-end space-x-4 sm:w-auto">
        {canCreateFolder
          ? (
              <Button
                type="button"
                onClick={handleCreateFolder}
                className={createFolderButtonClass}
              >
                {createFolderButtonContent}
              </Button>
            )
          : (
              <PremiumFeatureGate
                userRole={userRole}
                canAccess={false}
                featureName={t('featureName')}
                description={t('featureDescription')}
                onClick={handleCreateFolder}
                className={createFolderButtonClass}
              >
                {createFolderButtonContent}
              </PremiumFeatureGate>
            )}
      </div>
    </div>
  );
});

LibraryHeader.displayName = 'LibraryHeader';

export default LibraryHeader;
