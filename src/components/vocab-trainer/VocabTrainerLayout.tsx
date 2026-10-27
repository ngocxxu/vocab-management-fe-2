import type { VocabTrainerLayoutProps } from '@/types/vocab-trainer';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabTrainerContent from './VocabTrainerContent';

const VocabTrainerLayout: React.FC<VocabTrainerLayoutProps> = ({ initialData, initialLanguagesData, currentUser, loadError }) => {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-background">
        <div className={PAGE_CONTAINER_CLASS}>
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>
    )}
    >
      <VocabTrainerContent
        initialData={initialData}
        initialLanguagesData={initialLanguagesData}
        currentUser={currentUser}
        loadError={loadError}
      />
    </Suspense>
  );
};

export default VocabTrainerLayout;
