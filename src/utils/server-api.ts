import type { VocabQueryParams, VocabTrainerQueryParams } from './api-config';
import type { TVocab } from '@/types/vocab-list';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';
import { handleTokenExpiration } from '@/utils/auth-utils';
import { API_ENDPOINTS, API_METHODS } from './api-config';

class ServerAPI {
  private baseURL = Env.NESTJS_API_URL || 'http://localhost:3002/api/v1';
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

    // If not 401, return normally
    if (response.status !== 401) {
      return response;
    }

    // If 401 → try refresh
    if (!this.isRefreshing) {
      this.isRefreshing = fetch(`${Env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${API_ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieStore.toString(),
        },
      }).finally(() => {
        this.isRefreshing = null;
      });
    }

    const refreshRes = await this.isRefreshing;
    if (!refreshRes.ok) {
      const errorText = await refreshRes.text();
      console.error('Refresh failed:', {
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
    try {
      const response = await this.doFetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      const text = await response.text();

      if (!text || !contentType?.includes('application/json')) {
        // Return empty object for non-JSON responses (like 204 No Content)
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error('🚨 Server API Error:', {
        endpoint: `${this.baseURL}${endpoint}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        baseURL: this.baseURL,
      });
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  patch<T>(endpoint: string, data: any) {
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
    return serverApi.post(config.endpoint, config.data);
  },
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => {
    const config = API_METHODS.auth.signup(data);
    return serverApi.post(config.endpoint, config.data);
  },
  refresh: (data: { refreshToken: string }) => {
    const config = API_METHODS.auth.refresh(data);
    return serverApi.post(config.endpoint, config.data);
  },
  signout: () => {
    const config = API_METHODS.auth.signout();
    return serverApi.post(config.endpoint, {});
  },
  resetPassword: (data: { email: string }) => {
    const config = API_METHODS.auth.resetPassword(data);
    return serverApi.post(config.endpoint, config.data);
  },
  verify: () => {
    const config = API_METHODS.auth.verify();
    return serverApi.get(config.endpoint);
  },
};

// Vocabulary Management API endpoints
export const vocabApi = {
  getAll: (params?: VocabQueryParams) => {
    const config = API_METHODS.vocabs.getAll(params);
    return serverApi.get<TVocab[]>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabs.getById(id);
    return serverApi.get<TVocab>(config.endpoint);
  },
  create: (vocabData: any) => {
    const config = API_METHODS.vocabs.create(vocabData);
    return serverApi.post(config.endpoint, config.data);
  },
  update: (id: string, vocabData: any) => {
    const config = API_METHODS.vocabs.update(id, vocabData);
    return serverApi.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.vocabs.delete(id);
    return serverApi.delete(config.endpoint);
  },
  createBulk: (vocabData: any[]) => {
    const config = API_METHODS.vocabs.createBulk(vocabData);
    return serverApi.post(config.endpoint, config.data);
  },
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabs.deleteBulk(ids);
    return serverApi.post(config.endpoint, config.data);
  },
};

// Vocabulary Trainer API endpoints
export const vocabTrainerApi = {
  getAll: (params?: VocabTrainerQueryParams) => {
    const config = API_METHODS.vocabTrainers.getAll(params);
    return serverApi.get(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabTrainers.getById(id);
    return serverApi.get(config.endpoint);
  },
  create: (trainerData: any) => {
    const config = API_METHODS.vocabTrainers.create(trainerData);
    return serverApi.post(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.vocabTrainers.delete(id);
    return serverApi.delete(config.endpoint);
  },
  getExam: (id: string) => {
    const config = API_METHODS.vocabTrainers.getExam(id);
    return serverApi.get(config.endpoint);
  },
  submitExam: (id: string, testData: any) => {
    const config = API_METHODS.vocabTrainers.submitExam(id, testData);
    return serverApi.put(config.endpoint, config.data);
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
    return serverApi.get(config.endpoint);
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
    return serverApi.get(config.endpoint);
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
    return serverApi.get(config.endpoint);
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
  getMy: () => {
    const config = API_METHODS.languageFolders.getMy();
    return serverApi.get(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.languageFolders.getById(id);
    return serverApi.get(config.endpoint);
  },
  create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.create(languageFolderData);
    return serverApi.post(config.endpoint, config.data);
  },
  update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.update(id, languageFolderData);
    return serverApi.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.languageFolders.delete(id);
    return serverApi.delete(config.endpoint);
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
};
