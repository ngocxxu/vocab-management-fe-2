import type { VocabListContentProps } from '@/types/vocab-list';
import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import VocabList from './VocabList';

const VocabListContent: React.FC<VocabListContentProps> = ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
  vocabListLoadFailed,
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
          vocabListLoadFailed={vocabListLoadFailed}
        />
      </div>
    </div>
  );
};

export default VocabListContent;
