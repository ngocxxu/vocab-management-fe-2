import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TAdminUserRole, TAdminUsersQuery, TBroadcastPayload, TCreateAdminPlanInput, TUpdateAdminPlanInput, TUpdateAdminUserInput } from '@/types/admin';
import type { GenerateUploadSignatureInput } from '@/types/cloudinary';
import type {
  TNotificationInput,
  TUpdateNotificationStatusInput,
} from '@/types/notification';
import type { TUpdateSrsSettings } from '@/types/srs-settings';
import type { TBulkVocabUpdateItem, TCreateTextTarget, TCreateVocab, TUpdateTextTarget } from '@/types/vocab-list';
import type { TSemanticSearchGroupedParams, TSemanticSearchParams } from '@/types/vocab-search';
import type {
  TCloneVocabTrainer,
  TCreateVocabTrainer,
  TFormTestVocabTrainerUnion,
  TFsrsAnswerInput,
  TFsrsQueueParams,
  TUpdateFsrsSettings,
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
  filter?: 'recent' | 'difficult' | 'unstarted';
};

export type VocabConflictBySubjectParams = {
  subjectId: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  textSource?: string;
};

export type RandomVocabQueryParams = {
  count: number;
  languageFolderId?: string;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
};

export type TextTargetQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  textTarget?: string;
  grammar?: string;
  wordTypeId?: string;
  subjectIds?: string[];
};

export type QueryParamValue = string | number | boolean | string[] | undefined;

export const buildQueryString = (params: Record<string, QueryParamValue>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
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

export type NotificationQueryParams = {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
};

// API endpoint definitions
export const API_ENDPOINTS = {
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    plans: '/admin/plans',
    languages: '/admin/languages',
    wordTypes: '/admin/word-types',
  },
  auth: {
    refresh: '/auth/refresh',
    signout: '/auth/signout',
    deleteAccount: '/users/me',
    verify: '/auth/verify',
    sync: '/auth/sync',
  },
  vocabs: '/vocabs',
  textTargets: '/vocabs/:vocabId/text-targets',
  vocabTrainers: '/vocab-trainers',
  subjects: '/subjects',
  wordTypes: '/word-types',
  languages: '/languages',
  languageFolders: '/language-folders',
  apiKeys: '/api-keys',
  srsSettings: '/srs-settings',
  notifications: '/notifications',
  cloudinary: '/cloudinary',
  plans: '/plans',
  chatMessages: '/chat/messages',
  chatUnreadCount: '/chat/unread-count',
  chatRead: '/chat/read',
  config: '/config',
  cache: '/cache',
} as const;

// API method configurations
export const API_METHODS = {
  admin: {
    stats: () => ({ endpoint: API_ENDPOINTS.admin.stats }),
    users: {
      list: (params: TAdminUsersQuery) => {
        const query = buildQueryString({ ...params });
        return { endpoint: query ? `${API_ENDPOINTS.admin.users}?${query}` : API_ENDPOINTS.admin.users };
      },
      update: (id: string, data: TUpdateAdminUserInput) => ({ endpoint: `${API_ENDPOINTS.admin.users}/${id}`, data }),
      remove: (id: string) => ({ endpoint: `${API_ENDPOINTS.admin.users}/${id}` }),
    },
    // Create and update reuse the public /plans routes, which the BE guards with the admin role.
    plans: {
      list: () => ({ endpoint: API_ENDPOINTS.admin.plans }),
      create: (data: TCreateAdminPlanInput) => ({ endpoint: API_ENDPOINTS.plans, data }),
      update: (role: TAdminUserRole, data: TUpdateAdminPlanInput) => ({ endpoint: `${API_ENDPOINTS.plans}/${role}`, data }),
    },
    // Writes reuse the public /languages and /word-types routes, which the BE guards with the admin role.
    languages: {
      list: () => ({ endpoint: API_ENDPOINTS.admin.languages }),
    },
    wordTypes: {
      list: () => ({ endpoint: API_ENDPOINTS.admin.wordTypes }),
    },
  },
  auth: {
    refresh: (data: { refreshToken: string }) => ({ endpoint: API_ENDPOINTS.auth.refresh, data }),
    signout: () => ({ endpoint: API_ENDPOINTS.auth.signout }),
    deleteAccount: () => ({ endpoint: API_ENDPOINTS.auth.deleteAccount }),
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
    // Two routes, not one with a flag: the flat one returns TVocab[], the grouped
    // one returns TVocabSearchGroup[]. Separate endpoints keep each response a
    // single shape instead of a union every caller has to narrow.
    searchSemantic: (params: TSemanticSearchParams) => ({
      endpoint: `${API_ENDPOINTS.vocabs}/search/semantic?${buildQueryString(params)}`,
    }),
    searchSemanticGrouped: (params: TSemanticSearchGroupedParams) => ({
      endpoint: `${API_ENDPOINTS.vocabs}/search/semantic/grouped?${buildQueryString(params)}`,
    }),
    create: (vocabData: TCreateVocab) => ({ endpoint: API_ENDPOINTS.vocabs, data: vocabData }),
    update: (id: string, vocabData: Partial<TCreateVocab>) => ({ endpoint: `${API_ENDPOINTS.vocabs}/${id}`, data: vocabData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabs}/${id}` }),
    generateTextTarget: (data: { textSource: string; sourceLanguageCode: string; targetLanguageCode: string }) => ({ endpoint: `${API_ENDPOINTS.vocabs}/generate/text-target`, data }),
    createBulk: (vocabData: TCreateVocab[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/create`, data: { vocabData } }),
    updateBulk: (updates: TBulkVocabUpdateItem[]) => ({
      endpoint: `${API_ENDPOINTS.vocabs}/bulk/update`,
      data: { updates },
    }),
    deleteBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/delete`, data: { ids } }),
    getBulk: (ids: string[]) => ({ endpoint: `${API_ENDPOINTS.vocabs}/bulk/get`, data: { ids } }),
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
    getStatisticsProblematic: (params?: { status?: 'critical' | 'warning' | 'all'; limit?: number; page?: number; sourceLanguageCode?: string }) => {
      if (!params || (!params.status && !params.limit && !params.page && !params.sourceLanguageCode)) {
        return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/problematic` };
      }
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/problematic?${queryString}` };
    },
    getStatisticsProblematicLanguages: () => ({ endpoint: `${API_ENDPOINTS.vocabs}/statistics/problematic/languages` }),
    getStatisticsDistribution: () => ({ endpoint: `${API_ENDPOINTS.vocabs}/statistics/distribution` }),
    getStatisticsDashboard: (params?: {
      include?: string[];
      startDate?: string;
      endDate?: string;
    }) => {
      const queryParams: Record<string, QueryParamValue> = {};
      if (params?.include?.length) {
        queryParams.include = params.include.join(',');
      }
      if (params?.startDate) {
        queryParams.startDate = params.startDate;
      }
      if (params?.endDate) {
        queryParams.endDate = params.endDate;
      }
      const queryString = buildQueryString(queryParams);
      const suffix = queryString ? `?${queryString}` : '';
      return { endpoint: `${API_ENDPOINTS.vocabs}/statistics/dashboard${suffix}` };
    },
    random: (params: RandomVocabQueryParams) => {
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/random?${queryString}` };
    },
    conflictBySubject: (params: VocabConflictBySubjectParams) => {
      const queryString = buildQueryString(params);
      return { endpoint: `${API_ENDPOINTS.vocabs}/conflict/by-subject?${queryString}` };
    },
    conflictByTrainer: (vocabIds: string[]) => {
      const queryString = buildQueryString({ vocabIds: vocabIds.join(',') });
      return { endpoint: `${API_ENDPOINTS.vocabs}/conflict/by-trainer?${queryString}` };
    },
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
    clone: (id: string, data: TCloneVocabTrainer) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/clone`, data }),
    removeVocab: (id: string, vocabId: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/vocabs/${vocabId}` }),
    updateFsrsSettings: (id: string, settings: TUpdateFsrsSettings) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}`, data: settings }),
    getReviewQueue: (id: string, params?: TFsrsQueueParams) => {
      const queryString = params ? buildQueryString(params) : '';
      return { endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/review-queue${queryString ? `?${queryString}` : ''}` };
    },
    getReviewSummary: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/review-summary` }),
    getReviewStats: (id: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/review-stats` }),
    submitReviewAnswer: (id: string, answer: TFsrsAnswerInput) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/review-answer`, data: answer }),
    checkReviewAnswer: (id: string, cardId: string, answer: string) => ({ endpoint: `${API_ENDPOINTS.vocabTrainers}/${id}/review-check`, data: { cardId, answer } }),
  },
  subjects: {
    getAll: () => ({ endpoint: API_ENDPOINTS.subjects }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}` }),
    create: (subjectData: { name: string }) => ({ endpoint: API_ENDPOINTS.subjects, data: subjectData }),
    update: (id: string, subjectData: { name: string; order: number }) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}`, data: subjectData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.subjects}/${id}` }),
    reorder: (subjects: { id: string; order: number }[]) => ({ endpoint: `${API_ENDPOINTS.subjects}/reorder`, data: subjects }),
    generate: (data: { textTarget: string; targetLanguageCode: string }) => ({ endpoint: `${API_ENDPOINTS.subjects}/generate`, data }),
  },
  apiKeys: {
    getAll: () => ({ endpoint: API_ENDPOINTS.apiKeys }),
    create: (apiKeyData: { name: string; scopes: string[]; languageFolderId?: string }) => ({ endpoint: API_ENDPOINTS.apiKeys, data: apiKeyData }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.apiKeys}/${id}` }),
  },
  srsSettings: {
    get: () => ({ endpoint: API_ENDPOINTS.srsSettings }),
    update: (data: TUpdateSrsSettings) => ({ endpoint: API_ENDPOINTS.srsSettings, data }),
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
    getMy: (params?: NotificationQueryParams) => {
      const queryString = buildQueryString(params ?? {});
      return { endpoint: `${API_ENDPOINTS.notifications}/my${queryString ? `?${queryString}` : ''}` };
    },
    getUnread: (params?: NotificationQueryParams) => {
      const queryString = buildQueryString(params ?? {});
      return { endpoint: `${API_ENDPOINTS.notifications}/my/unread${queryString ? `?${queryString}` : ''}` };
    },
    getUnreadCount: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my/unread-count` }),
    markAsRead: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/my/mark-as-read` }),
    markAllAsRead: () => ({ endpoint: `${API_ENDPOINTS.notifications}/my/mark-all-as-read` }),
    delete: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/my` }),
    getById: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}` }),
    create: (notificationData: TNotificationInput) => ({ endpoint: API_ENDPOINTS.notifications, data: notificationData }),
    update: (id: string, notificationData: Partial<TNotificationInput>) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}`, data: notificationData }),
    updateStatus: (id: string, statusData: TUpdateNotificationStatusInput) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}/status`, data: statusData }),
    broadcast: (input: TBroadcastPayload) => ({ endpoint: `${API_ENDPOINTS.notifications}/broadcast`, data: input }),
    broadcastHistory: () => ({ endpoint: `${API_ENDPOINTS.notifications}/broadcasts` }),
    setActive: (id: string, isActive: boolean) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}`, data: { isActive } }),
    remove: (id: string) => ({ endpoint: `${API_ENDPOINTS.notifications}/${id}` }),
    cleanupExpired: () => ({ endpoint: `${API_ENDPOINTS.notifications}/cleanup/expired` }),
  },
  cloudinary: {
    getUploadSignature: (params?: GenerateUploadSignatureInput) => {
      const queryString = buildQueryString(params || {});
      return { endpoint: `${API_ENDPOINTS.cloudinary}/upload-signature${queryString ? `?${queryString}` : ''}` };
    },
  },
  textTargets: {
    getAll: (vocabId: string, params?: TextTargetQueryParams) => {
      const base = API_ENDPOINTS.textTargets.replace(':vocabId', vocabId);
      if (!params) {
        return { endpoint: base };
      }
      const queryString = buildQueryString(params);
      return { endpoint: queryString ? `${base}?${queryString}` : base };
    },
    getById: (vocabId: string, id: string) => ({
      endpoint: `${API_ENDPOINTS.textTargets.replace(':vocabId', vocabId)}/${id}`,
    }),
    create: (vocabId: string, data: TCreateTextTarget) => ({
      endpoint: API_ENDPOINTS.textTargets.replace(':vocabId', vocabId),
      data,
    }),
    update: (vocabId: string, id: string, data: TUpdateTextTarget) => ({
      endpoint: `${API_ENDPOINTS.textTargets.replace(':vocabId', vocabId)}/${id}`,
      data,
    }),
    delete: (vocabId: string, id: string) => ({
      endpoint: `${API_ENDPOINTS.textTargets.replace(':vocabId', vocabId)}/${id}`,
    }),
  },
  chat: {
    getMessages: (cursor?: string) => {
      const queryString = buildQueryString({ cursor, limit: 10 });
      return { endpoint: `${API_ENDPOINTS.chatMessages}${queryString ? `?${queryString}` : ''}` };
    },
    getUnreadCount: () => ({ endpoint: API_ENDPOINTS.chatUnreadCount }),
    markRead: () => ({ endpoint: API_ENDPOINTS.chatRead }),
  },
  config: {
    getSystem: (key: string) => ({ endpoint: `${API_ENDPOINTS.config}/system/${key}` }),
    setSystem: (key: string, value: string) => ({ endpoint: `${API_ENDPOINTS.config}/system/${key}`, data: { value } }),
    deleteSystem: (key: string) => ({ endpoint: `${API_ENDPOINTS.config}/system/${key}` }),
  },
  // clear drops only the app's own cache prefixes. The BE whole-database flush (DELETE /cache/flush) is deliberately not wired.
  cache: {
    stats: () => ({ endpoint: `${API_ENDPOINTS.cache}/stats` }),
    clear: () => ({ endpoint: `${API_ENDPOINTS.cache}/clear` }),
  },
} as const;
