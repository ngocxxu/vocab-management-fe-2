'use client';

import { AddCircle, Lock } from '@solar-icons/react/ssr';
import React, { useCallback, useState } from 'react';
import { cn } from '@/libs/utils';
import { UpsellModal } from '@/components/premium';
import { useTranslations } from 'next-intl';

import type { CreateFolderCardProps } from '@/types/language-folder';

const CreateFolderCard: React.FC<CreateFolderCardProps> = ({ onCreateFolder, canCreateFolder = true }) => {
  const t = useTranslations('library');
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
          {t('card.createTitle')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {canCreateFolder ? t('card.startJourney') : t('card.upgradeMore')}
        </p>
      </div>
      <UpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        featureName={t('header.featureName')}
        description={t('header.featureDescription')}
      />
    </>
  );
};

export default CreateFolderCard;
