import type { ResponseAPI, TLanguage } from '@/types';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TWordTypeResponse } from '@/types/word-type';

export const MOCK_VOCABS: TVocab[] = [
  {
    id: 'vocab-1',
    textSource: 'Hello',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'vi',
    textTargets: [
      {
        textTarget: 'Xin chào',
        wordType: { id: 'wt-1', name: 'Noun', description: 'A noun' },
        explanationSource: 'A greeting',
        explanationTarget: 'Lời chào',
        grammar: '',
        vocabExamples: [{ source: 'Hello world', target: 'Xin chào thế giới' }],
        textTargetSubjects: [
          { id: 'tts-1', subject: { id: 'subject-1', name: 'General', order: 1 } },
        ],
      },
    ],
    masteryScore: 0,
  },
  {
    id: 'vocab-2',
    textSource: 'Computer',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'vi',
    textTargets: [
      {
        textTarget: 'Máy tính',
        wordType: { id: 'wt-1', name: 'Noun', description: 'A noun' },
        explanationSource: 'An electronic device',
        explanationTarget: 'Thiết bị điện tử',
        grammar: '',
        vocabExamples: [{ source: 'My computer is fast', target: 'Máy tính của tôi nhanh' }],
        textTargetSubjects: [
          { id: 'tts-2', subject: { id: 'subject-2', name: 'Technology', order: 2 } },
        ],
      },
    ],
    masteryScore: 5,
  },
  {
    id: 'vocab-3',
    textSource: 'Beautiful',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'vi',
    textTargets: [
      {
        textTarget: 'Đẹp',
        wordType: { id: 'wt-2', name: 'Adjective', description: 'An adjective' },
        explanationSource: 'Pleasing to the senses',
        explanationTarget: 'Làm hài lòng các giác quan',
        grammar: '',
        vocabExamples: [{ source: 'Beautiful flower', target: 'Bông hoa đẹp' }],
        textTargetSubjects: [
          { id: 'tts-3', subject: { id: 'subject-1', name: 'General', order: 1 } },
        ],
      },
    ],
    masteryScore: 8,
  },
];

export const MOCK_SUBJECTS: TSubjectResponse = {
  items: [
    { id: 'subject-1', name: 'General', order: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 'user-1' },
    { id: 'subject-2', name: 'Technology', order: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 'user-1' },
    { id: 'subject-3', name: 'Business', order: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01', userId: 'user-1' },
  ],
  statusCode: 200,
};

export const MOCK_LANGUAGES: ResponseAPI<TLanguage[]> = {
  items: [
    { id: 'lang-1', name: 'English', code: 'en' },
    { id: 'lang-2', name: 'Vietnamese', code: 'vi' },
    { id: 'lang-3', name: 'French', code: 'fr' },
    { id: 'lang-4', name: 'Spanish', code: 'es' },
  ],
  totalItems: 4,
  totalPages: 1,
  currentPage: 1,
};

export const MOCK_WORD_TYPES: TWordTypeResponse = {
  items: [
    { id: 'wt-1', name: 'Noun', description: 'A noun' },
    { id: 'wt-2', name: 'Adjective', description: 'An adjective' },
    { id: 'wt-3', name: 'Verb', description: 'A verb' },
    { id: 'wt-4', name: 'Adverb', description: 'An adverb' },
  ],
  statusCode: 200,
};

export const MOCK_LANGUAGE_FOLDER = {
  id: 'folder-1',
  name: 'English - Vietnamese',
  folderColor: '#3b82f6',
  sourceLanguageCode: 'en',
  targetLanguageCode: 'vi',
  userId: 'user-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
