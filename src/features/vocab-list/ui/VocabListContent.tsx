import type { VocabListContentProps } from '@/types/vocab-list';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import VocabList from './VocabList';

const VocabListContent = async ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
  initialSemanticSuggestions,
  currentUser,
  vocabListLoadFailed,
}: VocabListContentProps) => {
  const t = await getTranslations('vocabList.breadcrumb');

  return (
    <div className="min-h-screen bg-background">
      <div className={PAGE_CONTAINER_CLASS}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/library">{t('library')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('vocabList')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <VocabList
          initialVocabsData={initialVocabsData}
          initialLanguageFolderData={initialLanguageFolderData}
          initialSubjectsData={initialSubjectsData}
          initialLanguagesData={initialLanguagesData}
          initialWordTypesData={initialWordTypesData}
          initialSemanticSuggestions={initialSemanticSuggestions}
          currentUser={currentUser}
          vocabListLoadFailed={vocabListLoadFailed}
        />
      </div>
    </div>
  );
};

export default VocabListContent;
