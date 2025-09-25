import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabListContent from './VocabListContent';

const VocabListLayout: React.FC = () => {
  return (
    <Suspense fallback={(
      <div className="h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>
    )}
    >
      <VocabListContent />
    </Suspense>
  );
};

export default VocabListLayout;
