import type {
  LanguageFolderQueryParams,
  NotificationQueryParams,
  RandomVocabQueryParams,
  TextTargetQueryParams,
  VocabConflictBySubjectParams,
  VocabQueryParams,
  VocabTrainerQueryParams,
} from './api-config';
import type { ResponseAPI, TLanguage, TLanguageFolder, TUser } from '@/types';
import type { TSignInMethods } from '@/types/auth';
import type { TPlan } from '@/types/plan';
import type {
  TAdminLanguage,
  TAdminPlan,
  TAdminStats,
  TAdminUser,
  TAdminUserRole,
  TAdminUsersQuery,
  TAdminWordType,
  TAiSettingKey,
  TBroadcastHistoryItem,
  TBroadcastPayload,
  TBroadcastResult,
  TCacheStats,
  TCreateAdminPlanInput,
  TSystemConfig,
  TUpdateAdminPlanInput,
  TUpdateAdminUserInput,
} from '@/types/admin';
import type { TApiKey, TApiKeyResponse, TApiKeyScope, TCreateApiKeyResponse } from '@/types/api-key';
import type {
  TDeleteNotificationResponse,
  TMarkAllAsReadResponse,
  TMarkAsReadResponse,
  TNotification,
  TNotificationInput,
  TUnreadCountResponse,
  TUpdateNotificationStatusInput,
} from '@/types/notification';
import type { TSrsSettings, TUpdateSrsSettings } from '@/types/srs-settings';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocabConflictListResponse, TVocabTrainerConflict } from '@/types/vocab-conflict';
import type { TBulkVocabUpdateItem, TCreateTextTarget, TCreateVocab, TTextTarget, TUpdateTextTarget, TVocab } from '@/types/vocab-list';
import type { TSemanticSearchGroupedParams, TSemanticSearchParams, TVocabSearchGroup } from '@/types/vocab-search';
import type {
  TCloneVocabTrainer,
  TCreateVocabTrainer,
  TFormTestVocabTrainerUnion,
  TFsrsAnswerCheck,
  TFsrsAnswerInput,
  TFsrsAnswerResult,
  TFsrsQueueParams,
  TFsrsReviewQueue,
  TFsrsReviewStats,
  TFsrsReviewSummary,
  TUpdateFsrsSettings,
  TVocabTrainer,
} from '@/types/vocab-trainer';
import type { TWordTypeResponse } from '@/types/word-type';
import { Env } from '@/libs/Env';
import { BackendRequestError } from '@/utils/backend-request-error';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, performRefresh } from '@/libs/refresh-lock';
import { getAccessToken, getRefreshToken, setAuthCookies } from '@/utils/auth-cookies';
import { API_ENDPOINTS, API_METHODS } from './api-config';

class ServerAPI {
  readonly baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';

  private async doFetch(endpoint: string, options: RequestInit, tokenOverride?: string): Promise<Response> {
    const token = tokenOverride ?? await getAccessToken();

    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  /**
   * Actions no longer call GET /auth/verify before every data call (it burned the per-minute throttle),
   * so an expired access token is refreshed here, once, when the backend answers 401.
   * Null means there is no session to refresh. `/auth/*` endpoints manage their own session.
   */
  private async refreshAccessToken(): Promise<string | null> {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const session = await getRefreshLock(getRefreshLockKey(accessToken, refreshToken)).getOrRefresh(
      () => performRefresh(refreshToken),
    );
    if (!session) {
      return null;
    }

    try {
      await setAuthCookies(session.access_token, session.refresh_token);
    } catch {
      // Cookies are read-only while a page renders; the request below still uses the new token and the proxy persists it on the next navigation.
    }
    return session.access_token;
  }

  private async fetchWithRefresh(endpoint: string, options: RequestInit): Promise<Response> {
    const response = await this.doFetch(endpoint, options);
    if (response.status !== 401 || endpoint.startsWith('/auth/')) {
      return response;
    }

    const refreshedToken = await this.refreshAccessToken();
    return refreshedToken ? this.doFetch(endpoint, options, refreshedToken) : response;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    const response = await this.fetchWithRefresh(endpoint, options);

    // 1. Handle Response Content
    // Check if the response is JSON based on headers or empty body (204)
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const contentLength = response.headers.get('content-length');
    const isEmpty = response.status === 204 || contentLength === '0';

    let data: T | string | null;

    try {
      if (isEmpty) {
        data = {} as T;
      } else if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      // Fallback if parsing fails
      data = null;
    }

    if (!response.ok) {
      const error = new BackendRequestError(response.statusText, response.status, data);

      if (response.status === 401) {
        logger.debug(`[API] ${options.method || 'GET'} ${endpoint}: unauthenticated`);
      } else {
        logger.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, { error });
      }

      throw error;
    }

    return data as T;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    logger.debug('Server API POST Request:', {
      endpoint: `${this.baseURL}${endpoint}`,
      dataKeys: data && typeof data === 'object' ? Object.keys(data as object) : [],
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const serverApi = new ServerAPI();

// Auth API endpoints
export const authApi = {
  deleteAccount: () => {
    const config = API_METHODS.auth.deleteAccount();
    return serverApi.delete<TUser>(config.endpoint);
  },
  verify: () => {
    const config = API_METHODS.auth.verify();
    return serverApi.get<TUser>(config.endpoint);
  },
  signInMethods: () => {
    const config = API_METHODS.auth.signInMethods();
    return serverApi.get<TSignInMethods>(config.endpoint);
  },
  addPassword: () => {
    const config = API_METHODS.auth.addPassword();
    return serverApi.post<{ emailSent: boolean }>(config.endpoint, config.data);
  },
};

// Vocabulary Management API endpoints
export const vocabApi = {
  getAll: (params?: VocabQueryParams) => {
    const config = API_METHODS.vocabs.getAll(params);
    return serverApi.get<ResponseAPI<TVocab[]>>(config.endpoint);
  },
  getConflictBySubject: (params: VocabConflictBySubjectParams) => {
    const config = API_METHODS.vocabs.conflictBySubject(params);
    return serverApi.get<TVocabConflictListResponse>(config.endpoint);
  },
  getConflictByTrainer: (vocabIds: string[]) => {
    const config = API_METHODS.vocabs.conflictByTrainer(vocabIds);
    return serverApi.get<TVocabTrainerConflict[]>(config.endpoint);
  },
  random: (params: RandomVocabQueryParams) => {
    const config = API_METHODS.vocabs.random(params);
    // Backend might return either a raw list or a paginated shape.
    return serverApi.get<ResponseAPI<TVocab[]> | TVocab[]>(config.endpoint);
  },
  // Called from Server Components, same as everything else here — not from
  // the browser, so no proxy route or CORS is needed for these two.
  searchSemantic: (params: TSemanticSearchParams) => {
    const config = API_METHODS.vocabs.searchSemantic(params);
    return serverApi.get<TVocab[]>(config.endpoint);
  },
  searchSemanticGrouped: (params: TSemanticSearchGroupedParams) => {
    const config = API_METHODS.vocabs.searchSemanticGrouped(params);
    return serverApi.get<TVocabSearchGroup[]>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabs.getById(id);
    return serverApi.get<TVocab>(config.endpoint);
  },
  create: (vocabData: TCreateVocab) => {
    if (!vocabData || typeof vocabData !== 'object') {
      throw new Error('Vocab data is required');
    }
    const config = API_METHODS.vocabs.create(vocabData);
    return serverApi.post<TVocab>(config.endpoint, config.data);
  },
  update: (id: string, vocabData: Partial<TCreateVocab>) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Vocab ID is required');
    }
    if (!vocabData || typeof vocabData !== 'object') {
      throw new Error('Vocab data is required');
    }
    const config = API_METHODS.vocabs.update(id, vocabData);
    return serverApi.put<TVocab>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Vocab ID is required');
    }
    const config = API_METHODS.vocabs.delete(id);
    return serverApi.delete<void>(config.endpoint);
  },
  createBulk: (vocabData: TCreateVocab[]) => {
    if (!Array.isArray(vocabData) || vocabData.length === 0) {
      throw new Error('Vocab data array is required and must not be empty');
    }
    const config = API_METHODS.vocabs.createBulk(vocabData);
    return serverApi.post<{ created: number; failed: number }>(config.endpoint, config.data);
  },
  updateBulk: (updates: TBulkVocabUpdateItem[]) => {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required and must not be empty');
    }
    const config = API_METHODS.vocabs.updateBulk(updates);
    return serverApi.post<TVocab[]>(config.endpoint, config.data);
  },
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabs.deleteBulk(ids);
    return serverApi.post(config.endpoint, config.data);
  },
  getBulk: (ids: string[]) => {
    if (!Array.isArray(ids)) {
      throw new TypeError('IDs array is required');
    }
    const config = API_METHODS.vocabs.getBulk(ids);
    return serverApi.post<TVocab[]>(config.endpoint, config.data);
  },
  importCsv: async (file: File, params: { languageFolderId: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const formData = new FormData();
    formData.append('file', file);

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_ENDPOINTS.vocabs}/import/csv?${queryString}`;

    const token = await getAccessToken();
    const response = await fetch(`${serverApi.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`CSV import failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
  exportCsv: async (params: VocabQueryParams): Promise<Response> => {
    const { buildQueryString } = await import('./api-config');
    const queryString = buildQueryString(params);
    const endpoint = `${API_ENDPOINTS.vocabs}/export/csv?${queryString}`;

    const token = await getAccessToken();
    const response = await fetch(`${serverApi.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`CSV export failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },
  generateTextTarget: (data: { textSource: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.vocabs.generateTextTarget(data);
    return serverApi.post<{ jobId: string }>(config.endpoint, config.data);
  },
};

// Text Target API endpoints
export const textTargetApi = {
  getAll: (vocabId: string, params?: TextTargetQueryParams) => {
    const config = API_METHODS.textTargets.getAll(vocabId, params);
    return serverApi.get<ResponseAPI<TTextTarget[]>>(config.endpoint);
  },
  getById: (vocabId: string, id: string) => {
    const config = API_METHODS.textTargets.getById(vocabId, id);
    return serverApi.get<TTextTarget>(config.endpoint);
  },
  create: (vocabId: string, data: TCreateTextTarget) => {
    const config = API_METHODS.textTargets.create(vocabId, data);
    return serverApi.post<TTextTarget>(config.endpoint, config.data);
  },
  update: (vocabId: string, id: string, data: TUpdateTextTarget) => {
    const config = API_METHODS.textTargets.update(vocabId, id, data);
    return serverApi.put<TTextTarget>(config.endpoint, config.data);
  },
  delete: (vocabId: string, id: string) => {
    const config = API_METHODS.textTargets.delete(vocabId, id);
    return serverApi.delete<void>(config.endpoint);
  },
};

// Statistics API endpoints
export const statisticsApi = {
  getSummary: async () => {
    const config = API_METHODS.vocabs.getStatisticsSummary();
    return serverApi.get<import('@/types/statistics').MasterySummary>(config.endpoint);
  },
  getBySubject: async () => {
    const config = API_METHODS.vocabs.getStatisticsBySubject();
    return serverApi.get<import('@/types/statistics').MasteryBySubject[]>(config.endpoint);
  },
  getProgress: async (params?: { startDate?: string; endDate?: string }) => {
    const config = API_METHODS.vocabs.getStatisticsProgress(params);
    return serverApi.get<import('@/types/statistics').ProgressOverTime[]>(config.endpoint);
  },
  getProblematic: async (params?: { status?: 'critical' | 'warning' | 'all'; limit?: number; page?: number; sourceLanguageCode?: string }) => {
    const config = API_METHODS.vocabs.getStatisticsProblematic(params);
    return serverApi.get<import('@/types/statistics').TopProblematicVocab[]>(config.endpoint);
  },
  getProblematicLanguages: async () => {
    const config = API_METHODS.vocabs.getStatisticsProblematicLanguages();
    return serverApi.get<import('@/types/statistics').TProblematicLanguage[]>(config.endpoint);
  },
  getDistribution: async () => {
    const config = API_METHODS.vocabs.getStatisticsDistribution();
    return serverApi.get<import('@/types/statistics').MasteryDistribution[]>(config.endpoint);
  },
  getDashboard: async (params?: {
    include?: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    const config = API_METHODS.vocabs.getStatisticsDashboard(params);
    return serverApi.get<import('@/types/statistics').TDashboardStatistics>(config.endpoint);
  },
};

// Vocabulary Trainer API endpoints
export const vocabTrainerApi = {
  getAll: (params?: VocabTrainerQueryParams) => {
    const config = API_METHODS.vocabTrainers.getAll(params);
    return serverApi.get<ResponseAPI<TVocabTrainer[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabTrainers.getById(id);
    return serverApi.get<TVocabTrainer>(config.endpoint);
  },
  create: (trainerData: TCreateVocabTrainer) => {
    if (!trainerData || typeof trainerData !== 'object') {
      throw new Error('Trainer data is required');
    }
    const config = API_METHODS.vocabTrainers.create(trainerData);
    return serverApi.post<TVocabTrainer>(config.endpoint, config.data);
  },
  update: (id: string, trainerData: Partial<TCreateVocabTrainer>) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Trainer ID is required');
    }
    if (!trainerData || typeof trainerData !== 'object') {
      throw new Error('Trainer data is required');
    }
    const config = API_METHODS.vocabTrainers.update(id, trainerData);
    return serverApi.put<TVocabTrainer>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Trainer ID is required');
    }
    const config = API_METHODS.vocabTrainers.delete(id);
    return serverApi.delete<void>(config.endpoint);
  },
  getExam: (id: string) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Trainer ID is required');
    }
    const config = API_METHODS.vocabTrainers.getExam(id);
    return serverApi.get<import('@/types/vocab-trainer').TQuestionAPI>(config.endpoint);
  },
  submitExam: (id: string, testData: TFormTestVocabTrainerUnion) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Trainer ID is required');
    }
    if (!testData || typeof testData !== 'object') {
      throw new Error('Test data is required');
    }
    const config = API_METHODS.vocabTrainers.submitExam(id, testData);
    return serverApi.patch<{ jobId: string } | { error: string }>(config.endpoint, config.data);
  },
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabTrainers.deleteBulk(ids);
    return serverApi.post(config.endpoint, config.data);
  },
  clone: (id: string, data: TCloneVocabTrainer) => {
    const config = API_METHODS.vocabTrainers.clone(id, data);
    return serverApi.post<TVocabTrainer>(config.endpoint, config.data);
  },
  removeVocab: (id: string, vocabId: string) => {
    const config = API_METHODS.vocabTrainers.removeVocab(id, vocabId);
    return serverApi.delete<TVocabTrainer>(config.endpoint);
  },
  updateFsrsSettings: (id: string, settings: TUpdateFsrsSettings) => {
    const config = API_METHODS.vocabTrainers.updateFsrsSettings(id, settings);
    return serverApi.patch<TVocabTrainer>(config.endpoint, config.data);
  },
  getReviewQueue: (id: string, params?: TFsrsQueueParams) => {
    const config = API_METHODS.vocabTrainers.getReviewQueue(id, params);
    return serverApi.get<TFsrsReviewQueue>(config.endpoint);
  },
  getReviewSummary: (id: string) => {
    const config = API_METHODS.vocabTrainers.getReviewSummary(id);
    return serverApi.get<TFsrsReviewSummary>(config.endpoint);
  },
  getReviewStats: (id: string) => {
    const config = API_METHODS.vocabTrainers.getReviewStats(id);
    return serverApi.get<TFsrsReviewStats>(config.endpoint);
  },
  submitReviewAnswer: (id: string, answer: TFsrsAnswerInput) => {
    const config = API_METHODS.vocabTrainers.submitReviewAnswer(id, answer);
    return serverApi.post<TFsrsAnswerResult>(config.endpoint, config.data);
  },
  checkReviewAnswer: (id: string, cardId: string, answer: string) => {
    const config = API_METHODS.vocabTrainers.checkReviewAnswer(id, cardId, answer);
    return serverApi.post<TFsrsAnswerCheck>(config.endpoint, config.data);
  },
};

// Subjects API endpoints
export const subjectsApi = {
  getAll: () => {
    const config = API_METHODS.subjects.getAll();
    return serverApi.get<TSubjectResponse>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.subjects.getById(id);
    return serverApi.get(config.endpoint);
  },
  create: (subjectData: { name: string; order: number }) => {
    const config = API_METHODS.subjects.create(subjectData);
    return serverApi.post(config.endpoint, config.data);
  },
  update: (id: string, subjectData: { name: string; order: number }) => {
    const config = API_METHODS.subjects.update(id, subjectData);
    return serverApi.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.subjects.delete(id);
    return serverApi.delete(config.endpoint);
  },
  reorder: (subjects: { id: string; order: number }[]) => {
    const config = API_METHODS.subjects.reorder(subjects);
    return serverApi.patch(config.endpoint, { subjectIds: config.data });
  },
  generate: (data: { textTarget: string; targetLanguageCode: string }): Promise<{ jobId: string }> => {
    const config = API_METHODS.subjects.generate(data);
    return serverApi.post(config.endpoint, config.data);
  },
};

// Spaced repetition (FSRS) defaults and timezone of the current user
export const srsSettingsApi = {
  get: () => {
    const config = API_METHODS.srsSettings.get();
    return serverApi.get<TSrsSettings>(config.endpoint);
  },
  update: (data: TUpdateSrsSettings) => {
    const config = API_METHODS.srsSettings.update(data);
    return serverApi.put<TSrsSettings>(config.endpoint, config.data);
  },
};

// API Keys API endpoints
export const apiKeysApi = {
  getAll: () => {
    const config = API_METHODS.apiKeys.getAll();
    return serverApi.get<TApiKeyResponse>(config.endpoint);
  },
  create: (apiKeyData: { name: string; scopes: TApiKeyScope[]; languageFolderId?: string }) => {
    const config = API_METHODS.apiKeys.create(apiKeyData);
    return serverApi.post<TCreateApiKeyResponse>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.apiKeys.delete(id);
    return serverApi.delete<TApiKey>(config.endpoint);
  },
};

// Word Types API endpoints
export const wordTypesApi = {
  getAll: () => {
    const config = API_METHODS.wordTypes.getAll();
    return serverApi.get<TWordTypeResponse>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.wordTypes.getById(id);
    return serverApi.get(config.endpoint);
  },
  create: (wordTypeData: { name: string; description: string }) => {
    const config = API_METHODS.wordTypes.create(wordTypeData);
    return serverApi.post(config.endpoint, config.data);
  },
  update: (id: string, wordTypeData: { name: string; description: string }) => {
    const config = API_METHODS.wordTypes.update(id, wordTypeData);
    return serverApi.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.wordTypes.delete(id);
    return serverApi.delete(config.endpoint);
  },
};

// Languages API endpoints
export const languagesApi = {
  getAll: () => {
    const config = API_METHODS.languages.getAll();
    return serverApi.get<ResponseAPI<TLanguage[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.languages.getById(id);
    return serverApi.get(config.endpoint);
  },
  create: (languageData: { name: string; code: string }) => {
    const config = API_METHODS.languages.create(languageData);
    return serverApi.post(config.endpoint, config.data);
  },
  update: (id: string, languageData: { name: string; code: string }) => {
    const config = API_METHODS.languages.update(id, languageData);
    return serverApi.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.languages.delete(id);
    return serverApi.delete(config.endpoint);
  },
};

// Language Folders API endpoints
export const languageFoldersApi = {
  getMy: (params?: LanguageFolderQueryParams) => {
    const config = API_METHODS.languageFolders.getMy(params);
    return serverApi.get<ResponseAPI<TLanguageFolder[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.languageFolders.getById(id);
    return serverApi.get<TLanguageFolder>(config.endpoint);
  },
  create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.create(languageFolderData);
    return serverApi.post<TLanguageFolder>(config.endpoint, config.data);
  },
  update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.update(id, languageFolderData);
    return serverApi.put<TLanguageFolder>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.languageFolders.delete(id);
    return serverApi.delete<TLanguageFolder>(config.endpoint);
  },
};

// Notifications API endpoints
export const notificationsApi = {
  getMy: (params?: NotificationQueryParams) => {
    const config = API_METHODS.notifications.getMy(params);
    return serverApi.get<ResponseAPI<TNotification[]>>(config.endpoint);
  },
  getUnread: (params?: NotificationQueryParams) => {
    const config = API_METHODS.notifications.getUnread(params);
    return serverApi.get<ResponseAPI<TNotification[]>>(config.endpoint);
  },
  getUnreadCount: () => {
    const config = API_METHODS.notifications.getUnreadCount();
    return serverApi.get<TUnreadCountResponse>(config.endpoint);
  },
  markAsRead: (id: string) => {
    const config = API_METHODS.notifications.markAsRead(id);
    return serverApi.patch<TMarkAsReadResponse>(config.endpoint, {});
  },
  markAllAsRead: () => {
    const config = API_METHODS.notifications.markAllAsRead();
    return serverApi.patch<TMarkAllAsReadResponse>(config.endpoint, {});
  },
  delete: (id: string) => {
    const config = API_METHODS.notifications.delete(id);
    return serverApi.delete<TDeleteNotificationResponse>(config.endpoint);
  },
  getById: (id: string) => {
    return serverApi.get<TNotification>(`${API_ENDPOINTS.notifications}/${id}`);
  },
  create: (notificationData: TNotificationInput) => {
    return serverApi.post<TNotification>(API_ENDPOINTS.notifications, notificationData);
  },
  update: (id: string, notificationData: Partial<TNotificationInput>) => {
    return serverApi.put<TNotification>(`${API_ENDPOINTS.notifications}/${id}`, notificationData);
  },
  updateStatus: (id: string, statusData: TUpdateNotificationStatusInput) => {
    return serverApi.patch<TNotification>(`${API_ENDPOINTS.notifications}/${id}/status`, statusData);
  },
  broadcast: (input: TBroadcastPayload) => {
    const config = API_METHODS.notifications.broadcast(input);
    return serverApi.post<TBroadcastResult>(config.endpoint, config.data);
  },
  broadcastHistory: () => {
    const config = API_METHODS.notifications.broadcastHistory();
    return serverApi.get<ResponseAPI<TBroadcastHistoryItem[]>>(config.endpoint);
  },
  setActive: (id: string, isActive: boolean) => {
    const config = API_METHODS.notifications.setActive(id, isActive);
    return serverApi.put<TNotification>(config.endpoint, config.data);
  },
  remove: (id: string) => {
    const config = API_METHODS.notifications.remove(id);
    return serverApi.delete<TNotification>(config.endpoint);
  },
  cleanupExpired: () => {
    const config = API_METHODS.notifications.cleanupExpired();
    return serverApi.delete<{ count: number }>(config.endpoint);
  },
};

// System config holds the four AI settings. The BE keeps them under ADMIN-only routes.
export const configApi = {
  getSystem: (key: TAiSettingKey) => {
    const config = API_METHODS.config.getSystem(key);
    return serverApi.get<TSystemConfig>(config.endpoint);
  },
  setSystem: (key: TAiSettingKey, value: string) => {
    const config = API_METHODS.config.setSystem(key, value);
    return serverApi.put<TSystemConfig>(config.endpoint, config.data);
  },
  deleteSystem: (key: TAiSettingKey) => {
    const config = API_METHODS.config.deleteSystem(key);
    return serverApi.delete<TSystemConfig>(config.endpoint);
  },
};

export const cacheApi = {
  stats: () => {
    const config = API_METHODS.cache.stats();
    return serverApi.get<TCacheStats>(config.endpoint);
  },
  clear: () => {
    const config = API_METHODS.cache.clear();
    return serverApi.delete<{ message: string }>(config.endpoint);
  },
};

export const adminApi = {
  stats: {
    get: () => {
      const config = API_METHODS.admin.stats();
      return serverApi.get<TAdminStats>(config.endpoint);
    },
  },
  users: {
    list: (params: TAdminUsersQuery) => {
      const config = API_METHODS.admin.users.list(params);
      return serverApi.get<ResponseAPI<TAdminUser[]>>(config.endpoint);
    },
    update: (id: string, data: TUpdateAdminUserInput) => {
      const config = API_METHODS.admin.users.update(id, data);
      return serverApi.patch<TAdminUser>(config.endpoint, config.data);
    },
    remove: (id: string) => {
      const config = API_METHODS.admin.users.remove(id);
      return serverApi.delete<TAdminUser>(config.endpoint);
    },
  },
  languages: {
    list: () => {
      const config = API_METHODS.admin.languages.list();
      return serverApi.get<TAdminLanguage[]>(config.endpoint);
    },
  },
  wordTypes: {
    list: () => {
      const config = API_METHODS.admin.wordTypes.list();
      return serverApi.get<TAdminWordType[]>(config.endpoint);
    },
  },
  plans: {
    list: () => {
      const config = API_METHODS.admin.plans.list();
      return serverApi.get<TAdminPlan[]>(config.endpoint);
    },
    create: (data: TCreateAdminPlanInput) => {
      const config = API_METHODS.admin.plans.create(data);
      return serverApi.post<TPlan>(config.endpoint, config.data);
    },
    update: (role: TAdminUserRole, data: TUpdateAdminPlanInput) => {
      const config = API_METHODS.admin.plans.update(role, data);
      return serverApi.put<TPlan>(config.endpoint, config.data);
    },
  },
};

// Main API object for easy access
export const api = {
  admin: adminApi,
  auth: authApi,
  vocab: vocabApi,
  vocabTrainer: vocabTrainerApi,
  subjects: subjectsApi,
  wordTypes: wordTypesApi,
  languages: languagesApi,
  languageFolders: languageFoldersApi,
  notifications: notificationsApi,
};
