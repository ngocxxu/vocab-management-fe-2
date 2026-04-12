import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ConflictVocabulariesContent from '@/features/subject-conflict-vocabs/ui/ConflictVocabulariesContent';
import { getConflictVocabsPageData } from '@/features/subject-conflict-vocabs/services/server/getConflictVocabsPageData';
import { Skeleton } from '@/shared/ui/skeleton';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ConflictVocabulariesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const subjectId = typeof resolvedParams.subjectId === 'string' ? resolvedParams.subjectId : undefined;
  if (!subjectId) {
    redirect('/subjects');
  }

  const { conflictData, subjects, conflictSubject, loadFailed } = await getConflictVocabsPageData(
    resolvedParams,
    subjectId,
  );

  return (
    <Suspense
      fallback={(
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-6 h-5 w-64" />
            <Skeleton className="mb-4 h-10 w-full max-w-xl" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}
    >
      <ConflictVocabulariesContent
        subjectId={subjectId}
        initialConflictData={conflictData}
        initialSubjectsData={subjects}
        conflictSubjectName={conflictSubject?.name ?? null}
        loadFailed={loadFailed}
      />
    </Suspense>
  );
}
