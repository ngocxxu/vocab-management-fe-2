import type { EQuestionType } from '@/enum/vocab-trainer';
import type { GenerateUploadSignatureInput } from '@/types/cloudinary';
import type {
  TNotificationInput,
  TUpdateNotificationStatusInput,
} from '@/types/notification';
import type { TCreateVocab } from '@/types/vocab-list';
import type {
  TCreateVocabTrainer,
  TFormTestVocabTrainerUnion,
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

export type LanguageFolderQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
    oauthSync: '/auth/oauth/sync',
  },
  vocabs: '/vocabs',
  vocabTrainers: '/vocab-trainers',
  subjects: '/subjects',
  wordTypes: '/word-types',
  languages: '/languages',
  languageFolders: '/language-folders',
  notifications: '/notifications',
  cloudinary: '/cloudinary',
} as const;

// API method configurations
export const API_METHODS = {
  auth: {
    signin: (data: { email: string; password: string }) => ({ endpoint: API_ENDPOINTS.auth.signin, data }),
    signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => ({ endpoint: API_ENDPOINTS.auth.signup, data }),
    refresh: (data: { refreshToken: string }) => ({ endpoint: API_ENDPOINTS.auth.refresh, data }),
    signout: () => ({ endpoint: API_ENDPOINTS.auth.signout }),
    resetPassword: (data: { email: string }) => ({ endpoint: API_ENDPOINTS.auth.resetPassword, data }),
    verify: () => ({ endpoint: API_ENDPOINTS.auth.verify }),
    oauthSync: (data: { accessToken: string }) => ({ endpoint: API_ENDPOINTS.auth.oauthSync, data }),
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
    createBulk: (vocabData: TCreateVocab[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/create`, data: { vocabData } }),
    deleteBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/delete`, data: { ids } }),
    importCsv: (params: { languageFolderId: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/import/csv?${queryString}` };
    },
    getStatisticsSummary: () => ({ endpoint: `${API_ENDPOINTS.vocabs}/statistics/summary` }),
    getStatisticsBySubject: () => ({ endpoint: `${API_ENDPOINTS.vocabs}/statistics/by-subject` }),
    getStatisticsProgress: (params?: { startDate?: string; endDate?: string }) => {
      if (!params || (!params.startDate && !params.endDate)) {
        return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/progress` };
      }
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/progress?${queryString}` };
    },
    getStatisticsProblematic: (params?: { minIncorrect?: number; limit?: number }) => {
      if (!params || (!params.minIncorrect && !params.limit)) {
        return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/problematic` };
      }
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/problematic?${queryString}` };
    },
    getStatisticsDistribution: () => ({ endpoint: `${API_ENDPOINTS.vocabs}/statistics/distribution` }),
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
    update: (id: string, trainerData: Partial<TCreateVocabTrainer>) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}`, data: trainerData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}` }),
    getExam: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/exam` }),
    submitExam: (id: string, testData: TFormTestVocabTrainerUnion) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/exam`, data: testData }),
    deleteBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/bulk/delete`, data: { ids } }),
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
    getMy: (params?: LanguageFolderQueryParams) => {
      if (!params) {
        return { endpoint: `${API_ENDPOINTS.languageFolders}/my` };
      }
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.languageFolders}/my?${queryString}` };
    },
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}` }),
    create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ({ endpoint: API_ENDPOINTS.languageFolders, data: languageFolderData }),
    update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}`, data: languageFolderData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.languageFolders}/${id}` }),
  },
  notifications: {
    getMy: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my` }),
    getUnread: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my/unread` }),
    getUnreadCount: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my/unread-count` }),
    markAsRead: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/my/mark-as-read` }),
    markAllAsRead: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my/mark-all-as-read` }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/my` }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}` }),
    create: (notificationData: TNotificationInput) => ({ endpoint: API_ENDPOINTS.notifications, data: notificationData }),
    update: (id: string, notificationData: Partial<TNotificationInput>) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}`, data: notificationData }),
    updateStatus: (id: string, statusData: TUpdateNotificationStatusInput) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/status`, data: statusData }),
  },
  cloudinary: {
    getUploadSignature: (params?: GenerateUploadSignatureInput) => {
      const queryString = buildQueryString(params || {});
      return { endpoint: `${API_ENDPOINTS.cloudinary}/upload-signature${queryString ? `?${queryString}` : ''}` };
    },
  },
} as const;
