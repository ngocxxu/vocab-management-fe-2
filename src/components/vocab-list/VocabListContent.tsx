import type { ResponseAPI, TLanguage, TLanguageFolder } from '@/types';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TWordTypeResponse } from '@/types/word-type';
import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { VocabList } from './index';

type VocabListContentProps = {
  initialVocabsData?: ResponseAPI<TVocab[]>;
  initialLanguageFolderData?: TLanguageFolder;
  initialSubjectsData?: TSubjectResponse;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  initialWordTypesData?: TWordTypeResponse;
};

const VocabListContent: React.FC<VocabListContentProps> = ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/library">Library</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vocab List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <VocabList
          initialVocabsData={initialVocabsData}
          initialLanguageFolderData={initialLanguageFolderData}
          initialSubjectsData={initialSubjectsData}
          initialLanguagesData={initialLanguagesData}
          initialWordTypesData={initialWordTypesData}
        />
      </div>
    </div>
  );
};

export default VocabListContent;
