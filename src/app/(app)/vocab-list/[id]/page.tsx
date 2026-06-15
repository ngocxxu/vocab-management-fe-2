import { notFound, redirect } from 'next/navigation';
import { getExpiredSessionRedirect, hasUnauthorizedError } from '@/utils/auth-error';
import { logger } from '@/libs/Logger';
import { getTextTargetsPageData } from '@/features/vocab-list/services/server/getTextTargetsPageData';
import TextTargetsContent from '@/features/vocab-list/ui/TextTargetsContent';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function TextTargetsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const { vocab, textTargetsData, subjectsData, wordTypesData, error } = await getTextTargetsPageData(id, resolvedSearchParams);

  if (hasUnauthorizedError([error])) {
    redirect(getExpiredSessionRedirect(`/vocab-list/${id}`));
  }

  if (error) {
    logger.error('Failed to fetch vocab text targets:', { error, id });
  }

  if (!vocab) {
    notFound();
  }

  return (
    <TextTargetsContent
      vocab={vocab}
      initialTextTargetsData={textTargetsData}
      initialSubjectsData={subjectsData}
      initialWordTypesData={wordTypesData}
    />
  );
}
