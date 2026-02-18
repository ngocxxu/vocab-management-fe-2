import type { VocabTrainerLayoutProps } from '@/types/vocab-trainer';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabTrainerContent from './VocabTrainerContent';

const VocabTrainerLayout: React.FC<VocabTrainerLayoutProps> = ({ initialData, initialLanguagesData }) => {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>
    )}
    >
      <VocabTrainerContent initialData={initialData} initialLanguagesData={initialLanguagesData} />
    </Suspense>
  );
};

export default VocabTrainerLayout;
