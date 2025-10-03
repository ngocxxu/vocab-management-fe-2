import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TCreateVocab } from '@/types/vocab-list';
import type {
  TCreateVocabTrainer,
  TFormTestVocabTrainer,
} from '@/types/vocab-trainer';

// Query parameters types
export type VocabQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  textSource?: string;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
  subjectIds?: string[];
  userId?: string;
  languageFolderId?: string;
};

// Utility function to build query string from parameters
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays by adding multiple parameters with the same key
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

export type VocabTrainerQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  status?: string | string[];
  questionType?: EQuestionType;
  userId?: string;
};

// API endpoint definitions
export const API_ENDPOINTS = {
  auth: {
    signin: '/auth/signin',
    signup: '/auth/signup',
    refresh: '/auth/refresh',
    signout: '/auth/signout',
    resetPassword: '/auth/reset-password',
    verify: '/auth/verify',
  },
  vocabs: '/vocabs',
  vocabTrainers: '/vocab-trainers',
  subjects: '/subjects',
  wordTypes: '/word-types',
  languages: '/languages',
  languageFolders: '/language-folders',
} as const;

// API method configurations
export const API_METHODS = {
  auth: {
    signin: (data: { email: string; password: string }) => ({ endpoint: API_ENDPOINTS.auth.signin, data }),
    signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => ({ endpoint: API_ENDPOINTS.auth.signin, data }),
    refresh: (data: { refreshToken: string }) => ({ endpoint: API_ENDPOINTS.auth.refresh, data }),
    signout: () => ({ endpoint: API_ENDPOINTS.auth.signout }),
    resetPassword: (data: { email: string }) => ({ endpoint: API_ENDPOINTS.auth.resetPassword, data }),
    verify: () => ({ endpoint: API_ENDPOINTS.auth.verify }),
  },
  vocabs: {
    getAll: (params?: VocabQueryParams) => {
      if (!params) {
        return { endpoint: API_ENDPOINTS.vocabs };
      }

      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}?${queryString}` };
    },
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabs}/${id}` }),
    create: (vocabData: TCreateVocab) => ({ endpoint: API_ENDPOINTS.vocabs, data: vocabData }),
    update: (id: string, vocabData: Partial<TCreateVocab>) => ({ endpoint: `${API_ENDPOINTS.vocabs}/${id}`, data: vocabData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabs}/${id}` }),
    createBulk: (vocabData: TCreateVocab[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/create`, data: { data: { vocabData } } }),
    deleteBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/delete`, data: { data: { ids } } }),
  },
  vocabTrainers: {
    getAll: (params?: VocabTrainerQueryParams) => {
      if (!params) {
        return { endpoint: API_ENDPOINTS.vocabTrainers };
      }

      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabTrainers}?${queryString}` };
    },
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}` }),
    create: (trainerData: TCreateVocabTrainer) => ({ endpoint: API_ENDPOINTS.vocabTrainers, data: trainerData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}` }),
    getExam: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/exam` }),
    submitExam: (id: string, testData: TFormTestVocabTrainer) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/exam`, data: testData }),
    deleteBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/bulk/delete`, data: { data: { ids } } }),
  },
  subjects: {
    getAll: () => ({ endpoint: API_ENDPOINTS.subjects }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}` }),
    create: (subjectData: { name: string }) => ({ endpoint: API_ENDPOINTS.subjects, data: subjectData }),
    update: (id: string, subjectData: { name: string; order: number }) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}`, data: subjectData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}` }),
    reorder: (subjects: { id: string; order: number }[]) => ({ endpoint: `${API_ENDPOINTS.subjects}/reorder`, data: subjects }),
  },
  wordTypes: {
    getAll: () => ({ endpoint: API_ENDPOINTS.wordTypes }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.wordTypes}/${id}` }),
    create: (wordTypeData: { name: string; description: string }) => ({ endpoint: API_ENDPOINTS.wordTypes, data: wordTypeData }),
    update: (id: string, wordTypeData: { name: string; description: string }) => ({ endpoint: `${API_ENDPOINTS.wordTypes}/${id}`, data: wordTypeData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.wordTypes}/${id}` }),
  },
  languages: {
    getAll: () => ({ endpoint: API_ENDPOINTS.languages }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.languages}/${id}` }),
    create: (languageData: { name: string; code: string }) => ({ endpoint: API_ENDPOINTS.languages, data: languageData }),
    update: (id: string, languageData: { name: string; code: string }) => ({ endpoint: `${API_ENDPOINTS.languages}/${id}`, data: languageData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.languages}/${id}` }),
  },
  languageFolders: {
    getMy: () => ({ endpoint: `${API_ENDPOINTS.languageFolders}/my` }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}` }),
    create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ({ endpoint: API_ENDPOINTS.languageFolders, data: languageFolderData }),
    update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}`, data: languageFolderData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}` }),
  },
} as const;
