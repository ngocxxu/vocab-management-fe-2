import { SubjectSection } from '@/components/settings';
import { getSubjectsPageData } from '@/features/subjects/services/server/getSubjectsPageData';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const { initialSubjectsData } = await getSubjectsPageData();
  return (
    <SubjectSection initialSubjectsData={initialSubjectsData} />
  );
}
