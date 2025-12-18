import type { ResponseAPI, TLanguage } from '@/types';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabTrainerContent from './VocabTrainerContent';

type VocabTrainerLayoutProps = {
  initialData?: ResponseAPI<TVocabTrainer[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

const VocabTrainerLayout: React.FC<VocabTrainerLayoutProps> = ({ initialData, initialLanguagesData }) => {
  return (
    <Suspense fallback={(
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
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
