import type { ResponseAPI, TLanguage, TLanguageFolder } from '@/types';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TWordTypeResponse } from '@/types/word-type';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import VocabListContent from './VocabListContent';

type VocabListLayoutProps = {
  initialVocabsData?: ResponseAPI<TVocab[]>;
  initialLanguageFolderData?: TLanguageFolder;
  initialSubjectsData?: TSubjectResponse;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  initialWordTypesData?: TWordTypeResponse;
};

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
