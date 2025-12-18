import { Library } from '@/components/library';
import { languageFoldersApi } from '@/utils/server-api';

// Define the shape of search params explicitly
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LibraryPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  // 1. Safe parsing & validation with fallback defaults
  // Use Number() and check validity to prevent NaN errors
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'name',
    sortOrder: (resolvedParams.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
  };

  try {
    // 2. Fetch data server-side
    // This runs on the server before the page is rendered
    const initialData = await languageFoldersApi.getMy(queryParams);

    // 3. Pass data to the Client Component
    return <Library initialData={initialData} />;
  } catch (error) {
    // 4. Basic Error Handling
    console.error('Failed to fetch library data:', error);

    // Create an error object compatible with your UI or redirect
    // Ideally, throw error to trigger error.tsx
    throw new Error('Failed to load library data');
  }
}
