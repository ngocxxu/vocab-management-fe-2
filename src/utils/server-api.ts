import type { LanguageFolderQueryParams, VocabQueryParams, VocabTrainerQueryParams } from './api-config';
import type { ResponseAPI, TLanguage, TLanguageFolder, TUser } from '@/types';
import type { TAuthResponse, TOAuthSyncResponse } from '@/types/auth';
import type {
  TDeleteNotificationResponse,
  TMarkAllAsReadResponse,
  TMarkAsReadResponse,
  TNotification,
  TNotificationInput,
  TUnreadCountResponse,
  TUpdateNotificationStatusInput,
} from '@/types/notification';
import type { TSubjectResponse } from '@/types/subject';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion, TVocabTrainer } from '@/types/vocab-trainer';
import type { TWordTypeResponse } from '@/types/word-type';
import { ApiError } from 'next/dist/server/api-utils';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { handleTokenExpiration } from '@/utils/auth-utils';
import { API_ENDPOINTS, API_METHODS } from './api-config';

class ServerAPI {
  private readonly baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';
  private isRefreshing: Promise<Response> | null = null; // avoid race condition

  private async doFetch(endpoint: string, options: RequestInit): Promise<Response> {
    const cookieStore = await cookies();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString(),
        ...options.headers,
      },
    });

    // If not 401 or 403, return normally
    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    // If 401 or 403 → try refresh
    this.isRefreshing ??= fetch(`${Env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString(),
      },
    }).finally(() => {
      this.isRefreshing = null;
    });

    const refreshRes = await this.isRefreshing;
    if (!refreshRes.ok) {
      const errorText = await refreshRes.text();
      logger.error('Refresh failed:', {
        status: refreshRes.status,
        statusText: refreshRes.statusText,
        error: errorText,
      });

      // Handle token expiration (server-side)
      handleTokenExpiration();
      throw new Error(`Refresh failed - needs login again (${refreshRes.status}: ${refreshRes.statusText})`);
    }

    // Get updated cookies from refresh response
    const updatedCookieStore = await cookies();

    // Retry request after refresh successfully, with new cookie
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': updatedCookieStore.toString(),
        ...options.headers,
      },
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    const response = await this.doFetch(endpoint, options);

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

    // 2. Handle Errors
    if (!response.ok) {
      const error = new ApiError(response.status, response.statusText);

      logger.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, { error });

      throw error;
    }

    return data as T;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    logger.debug('Server API POST Request:', {
      endpoint: `${this.baseURL}${endpoint}`,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  patch<T>(endpoint: string, data: unknown) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const serverApi = new ServerAPI();

// Auth API endpoints
export const authApi = {
  signin: (data: { email: string; password: string }) => {
    const config = API_METHODS.auth.signin(data);
    return serverApi.post<TAuthResponse>(config.endpoint, config.data);
  },
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => {
    const config = API_METHODS.auth.signup(data);
    return serverApi.post<TAuthResponse>(config.endpoint, config.data);
  },
  refresh: (data: { refreshToken: string }) => {
    const config = API_METHODS.auth.refresh(data);
    return serverApi.post<{ message: string }>(config.endpoint, config.data);
  },
  signout: () => {
    const config = API_METHODS.auth.signout();
    return serverApi.post<{ message: string }>(config.endpoint, {});
  },
  resetPassword: (data: { email: string }) => {
    const config = API_METHODS.auth.resetPassword(data);
    return serverApi.post<{ message: string }>(config.endpoint, config.data);
  },
  verify: () => {
    const config = API_METHODS.auth.verify();
    return serverApi.get<TUser>(config.endpoint);
  },
  oauthSync: (data: { accessToken: string; refreshToken: string }) => {
    const config = API_METHODS.auth.oauthSync(data);
    return serverApi.post<TOAuthSyncResponse>(config.endpoint, config.data);
  },
};

// Vocabulary Management API endpoints
export const vocabApi = {
  getAll: (params?: VocabQueryParams) => {
    const config = API_METHODS.vocabs.getAll(params);
    return serverApi.get<ResponseAPI<TVocab[]>>(config.endpoint);
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
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabs.deleteBulk(ids);
    return serverApi.post(config.endpoint, config.data);
  },
  importCsv: async (file: File, params: { languageFolderId: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const formData = new FormData();
    formData.append('file', file);

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_ENDPOINTS.vocabs}/import/csv?${queryString}`;

    const cookieStore = await cookies();
    const backendUrl = `${Env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${endpoint}`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: cookieStore.toString(),
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

    const cookieStore = await cookies();
    const backendUrl = `${Env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${endpoint}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(`CSV export failed: ${response.status} ${response.statusText}`);
    }

    return response;
  },
  generateTextTarget: (data: { textSource: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    if (!data.textSource || !data.sourceLanguageCode || !data.targetLanguageCode) {
      throw new Error('textSource, sourceLanguageCode, and targetLanguageCode are required');
    }
    const config = API_METHODS.vocabs.generateTextTarget(data);
    return serverApi.post<{
      textTarget: string;
      wordTypeId: string;
      explanationSource: string;
      explanationTarget: string;
      subjectIds: string[];
      vocabExamples: Array<{ source: string; target: string }>;
    }>(config.endpoint, config.data);
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
  getProblematic: async (params?: { minIncorrect?: number; limit?: number }) => {
    const config = API_METHODS.vocabs.getStatisticsProblematic(params);
    return serverApi.get<import('@/types/statistics').TopProblematicVocab[]>(config.endpoint);
  },
  getDistribution: async () => {
    const config = API_METHODS.vocabs.getStatisticsDistribution();
    return serverApi.get<import('@/types/statistics').MasteryDistribution[]>(config.endpoint);
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
    return serverApi.get(config.endpoint);
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
  getMy: (includeDeleted?: boolean) => {
    const config = API_METHODS.notifications.getMy();
    const endpoint = includeDeleted ? `${config.endpoint}?includeDeleted=true` : config.endpoint;
    return serverApi.get<ResponseAPI<TNotification[]>>(endpoint);
  },
  getUnread: () => {
    const config = API_METHODS.notifications.getUnread();
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
};

// Main API object for easy access
export const api = {
  auth: authApi,
  vocab: vocabApi,
  vocabTrainer: vocabTrainerApi,
  subjects: subjectsApi,
  wordTypes: wordTypesApi,
  languages: languagesApi,
  languageFolders: languageFoldersApi,
  notifications: notificationsApi,
};
