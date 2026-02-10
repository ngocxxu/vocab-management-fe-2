import { SubjectSection } from '@/components/settings';
import { subjectsApi } from '@/utils/server-api';

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  let initialSubjectsData;
  try {
    initialSubjectsData = await subjectsApi.getAll();
  } catch {
    initialSubjectsData = undefined;
  }
  return (
    <SubjectSection initialSubjectsData={initialSubjectsData} />
  );
}
