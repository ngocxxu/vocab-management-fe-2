import type { VocabTrainerContentProps } from '@/types/vocab-trainer';
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
} from '@/components/ui/breadcrumb';
import { VocabTrainerList } from './index';

const VocabTrainerContent = async ({ initialData, initialLanguagesData, currentUser, loadError }: VocabTrainerContentProps) => {
  const t = await getTranslations('trainer.breadcrumb');

  return (
    <div
      className="min-h-screen bg-background"
      suppressHydrationWarning
    >
      <div
        className={PAGE_CONTAINER_CLASS}
        suppressHydrationWarning
      >
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">{t('dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('trainer')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <VocabTrainerList
          initialData={initialData}
          initialLanguagesData={initialLanguagesData}
          currentUser={currentUser}
          loadError={loadError}
        />
      </div>
    </div>
  );
};

export default VocabTrainerContent;
