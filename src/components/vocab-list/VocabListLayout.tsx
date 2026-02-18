import type { VocabListLayoutProps } from '@/types/vocab-list';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabListContent from './VocabListContent';

const VocabListLayout: React.FC<VocabListLayoutProps> = ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
}) => {
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
      <VocabListContent
        initialVocabsData={initialVocabsData}
        initialLanguageFolderData={initialLanguageFolderData}
        initialSubjectsData={initialSubjectsData}
        initialLanguagesData={initialLanguagesData}
        initialWordTypesData={initialWordTypesData}
      />
    </Suspense>
  );
};

export default VocabListLayout;
