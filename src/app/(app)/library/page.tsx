import { verifyUser } from '@/actions';
import { getPlans } from '@/actions/plans';
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
    const [user, pageData] = await Promise.all([
      verifyUser(),
      getLibraryPageData(resolvedParams),
    ]);
    const currentPlan = user?.role ? (await getPlans(user.role))[0] ?? null : null;
    const { initialData, initialLanguagesData } = pageData;
    return (
      <Library
        initialData={initialData}
        initialLanguagesData={initialLanguagesData}
        currentUser={user}
        currentPlan={currentPlan}
      />
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/library'));
    }

    logger.error('Failed to fetch library data:', { error });
    throw new Error('Failed to load library data');
  }
}
