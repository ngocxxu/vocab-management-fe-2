import type { NextRequest } from 'next/server';
import type { VocabQueryParams } from '@/utils/api-config';
import { NextResponse } from 'next/server';

// Mock data for demonstration - replace with your actual data source
const mockVocabs = [
  {
    id: '1',
    sourceLanguageCode: 'vi',
    targetLanguageCode: 'en',
    textSource: 'Xin chào',
    textTargets: [
      {
        textTarget: 'Hello',
        wordType: { id: '1', name: 'Greeting', description: 'A greeting expression' },
        explanationSource: 'Lời chào hỏi',
        explanationTarget: 'A greeting',
        vocabExamples: [{ source: 'Xin chào bạn', target: 'Hello friend' }],
        grammar: 'Interjection',
        textTargetSubjects: [{ id: '1', subject: { id: '1', name: 'Basic', order: 1 } }],
      },
    ],
  },
  // Add more mock data as needed
];

// GET /api/vocabs - Get all vocabularies with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract all query parameters
    const queryParams: VocabQueryParams = {};

    // Pagination
    if (searchParams.has('page')) {
      queryParams.page = Number.parseInt(searchParams.get('page')!, 10);
    }
    if (searchParams.has('pageSize')) {
      queryParams.pageSize = Number.parseInt(searchParams.get('pageSize')!, 10);
    }

    // Sorting
    if (searchParams.has('sortBy')) {
      queryParams.sortBy = searchParams.get('sortBy')!;
    }
    if (searchParams.has('sortOrder')) {
      queryParams.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    }

    // Filtering
    if (searchParams.has('textSource')) {
      queryParams.textSource = searchParams.get('textSource')!;
    }
    if (searchParams.has('sourceLanguageCode')) {
      queryParams.sourceLanguageCode = searchParams.get('sourceLanguageCode')!;
    }
    if (searchParams.has('targetLanguageCode')) {
      queryParams.targetLanguageCode = searchParams.get('targetLanguageCode')!;
    }
    if (searchParams.has('subjectIds')) {
      queryParams.subjectIds = searchParams.get('subjectIds')!.split(',');
    }
    if (searchParams.has('userId')) {
      queryParams.userId = searchParams.get('userId')!;
    }

    // Filter and process the data based on query parameters
    let filteredVocabs = [...mockVocabs];

    // Apply text source filter
    if (queryParams.textSource) {
      filteredVocabs = filteredVocabs.filter(vocab =>
        vocab.textSource.toLowerCase().includes(queryParams.textSource!.toLowerCase()),
      );
    }

    // Apply language filters
    if (queryParams.sourceLanguageCode) {
      filteredVocabs = filteredVocabs.filter(vocab =>
        vocab.sourceLanguageCode === queryParams.sourceLanguageCode,
      );
    }

    if (queryParams.targetLanguageCode) {
      filteredVocabs = filteredVocabs.filter(vocab =>
        vocab.targetLanguageCode === queryParams.targetLanguageCode,
      );
    }

    // Apply subject filter
    if (queryParams.subjectIds && queryParams.subjectIds.length > 0) {
      filteredVocabs = filteredVocabs.filter(vocab =>
        vocab.textTargets.some(textTarget =>
          textTarget.textTargetSubjects.some(subject =>
            queryParams.subjectIds!.includes(subject.subject.id),
          ),
        ),
      );
    }

    // Apply sorting
    if (queryParams.sortBy) {
      const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
      filteredVocabs.sort((a, b) => {
        const aValue = a[queryParams.sortBy as keyof typeof a];
        const bValue = b[queryParams.sortBy as keyof typeof b];

        if (aValue < bValue) {
          return -1 * sortOrder;
        }
        if (aValue > bValue) {
          return 1 * sortOrder;
        }
        return 0;
      });
    }

    // Apply pagination
    if (queryParams.page && queryParams.pageSize) {
      const startIndex = (queryParams.page - 1) * queryParams.pageSize;
      const endIndex = startIndex + queryParams.pageSize;
      filteredVocabs = filteredVocabs.slice(startIndex, endIndex);
    }

    return NextResponse.json(filteredVocabs);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocabularies' },
      { status: 500 },
    );
  }
}

// POST /api/vocabs - Create new vocabulary
export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json();

    // Create new vocab with generated ID
    const newVocab = {
      id: Date.now().toString(),
      ...body,
    };

    // Add to mock data (in real app, save to database)
    mockVocabs.push(newVocab);

    return NextResponse.json(newVocab, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vocabulary' },
      { status: 500 },
    );
  }
}
