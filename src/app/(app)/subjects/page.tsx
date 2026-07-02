import { SubjectSection } from '@/components/settings';
import { getSubjectsPageData } from '@/features/subjects/services/server/getSubjectsPageData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const { initialSubjectsData, error } = await getSubjectsPageData();
  if (isUnauthorizedError(error)) {
    redirect(getExpiredSessionRedirect('/subjects'));
  }

  return (
    <SubjectSection initialSubjectsData={initialSubjectsData} />
  );
}
