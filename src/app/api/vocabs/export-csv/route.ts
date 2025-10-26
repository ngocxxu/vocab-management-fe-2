import type { NextRequest } from 'next/server';
import { vocabApi } from '@/utils/server-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
      textSource: searchParams.get('textSource') || undefined,
      sourceLanguageCode: searchParams.get('sourceLanguageCode') || undefined,
      targetLanguageCode: searchParams.get('targetLanguageCode') || undefined,
      languageFolderId: searchParams.get('languageFolderId') || undefined,
      subjectIds: searchParams.getAll('subjectIds').length > 0 ? searchParams.getAll('subjectIds') : undefined,
    };

    const response = await vocabApi.exportCsv(params);
    const blob = await response.blob();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vocabs-export-${timestamp}.csv`;

    return new Response(blob, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return new Response('Failed to export CSV', { status: 500 });
  }
}
