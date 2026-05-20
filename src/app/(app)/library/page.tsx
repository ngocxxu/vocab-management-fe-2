import { Library } from '@/components/library';
import { getLibraryPageData } from '@/features/library/services/server/getLibraryPageData';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Define the shape of search params explicitly
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LibraryPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  try {
    const { initialData, initialLanguagesData } = await getLibraryPageData(resolvedParams);
    return <Library initialData={initialData} initialLanguagesData={initialLanguagesData} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/library'));
    }

    logger.error('Failed to fetch library data:', { error });
    throw new Error('Failed to load library data');
  }
}
