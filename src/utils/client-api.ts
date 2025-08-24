import type { AxiosRequestConfig } from 'axios';
import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type {
  TCreateVocabTrainer,
  TFormTestVocabTrainer,
  TQuestionAPI,
  TVocabTrainer,
} from '@/types/vocab-trainer';
import axiosInstance from '@/libs/axios';

// Query parameters type for vocabularies
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
};

// Query parameters type for vocab trainers
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

// Generic API client with common methods
export class ApiClient {
  // GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  }

  // POST request
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // PATCH request
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  }
}

// Auth API endpoints
export const authApi = {
  signin: (data: { email: string; password: string }) => ApiClient.post('/auth/signin', data),
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: string;
  }) => ApiClient.post('/auth/signup', data),
  refresh: (data: { refreshToken: string }) => ApiClient.post('/auth/refresh', data),
  signout: () => ApiClient.post('/auth/signout'),
  resetPassword: (data: { email: string }) => ApiClient.post('/auth/reset-password', data),
  verify: () => ApiClient.get('/auth/verify'),
};

// Vocabulary Management API endpoints
export const vocabApi = {
  getAll: (params?: VocabQueryParams) => ApiClient.get<TVocab[]>('/vocabs', { params }),
  getById: (id: string) => ApiClient.get<TVocab>(`/vocabs/${id}`),
  create: (vocabData: TCreateVocab) => ApiClient.post<TVocab>('/vocabs', vocabData),
  update: (id: string, vocabData: Partial<TCreateVocab>) => ApiClient.put<TVocab>(`/vocabs/${id}`, vocabData),
  delete: (id: string) => ApiClient.delete(`/vocabs/${id}`),
  createBulk: (vocabData: TCreateVocab[]) => ApiClient.post(`/vocabs/bulk/create`, { data: { vocabData } }),
  deleteBulk: (ids: string[]) => ApiClient.post(`/vocabs/bulk/delete`, { data: { ids } }),
};

// Vocabulary Trainer API endpoints
export const vocabTrainerApi = {
  getAll: () => ApiClient.get<TVocabTrainer[]>('/vocab-trainers'),
  getById: (id: string) => ApiClient.get<TVocabTrainer>(`/vocab-trainers/${id}`),
  create: (trainerData: TCreateVocabTrainer) => ApiClient.post<TVocabTrainer>('/vocab-trainers', trainerData),
  delete: (id: string) => ApiClient.delete(`/vocab-trainers/${id}`),
  getExam: (id: string) => ApiClient.get<TQuestionAPI>(`/vocab-trainers/${id}/exam`),
  submitExam: (id: string, testData: TFormTestVocabTrainer) => ApiClient.patch(`/vocab-trainers/${id}/exam`, testData),
  deleteBulk: (ids: string[]) => ApiClient.post(`/vocab-trainers/bulk/delete`, { data: { ids } }),
};

// Subjects API endpoints
export const subjectsApi = {
  getAll: () => ApiClient.get('/subjects'),
  getById: (id: string) => ApiClient.get(`/subjects/${id}`),
  create: (subjectData: { name: string; order: number }) => ApiClient.post('/subjects', subjectData),
  update: (id: string, subjectData: { name: string; order: number }) => ApiClient.put(`/subjects/${id}`, subjectData),
  delete: (id: string) => ApiClient.delete(`/subjects/${id}`),
  reorder: (subjectIds: string[]) => ApiClient.post('/subjects/reorder', subjectIds),
};

// Word Types API endpoints
export const wordTypesApi = {
  getAll: () => ApiClient.get('/word-types'),
  getById: (id: string) => ApiClient.get(`/word-types/${id}`),
  create: (wordTypeData: { name: string; description: string }) => ApiClient.post('/word-types', wordTypeData),
  update: (id: string, wordTypeData: { name: string; description: string }) => ApiClient.put(`/word-types/${id}`, wordTypeData),
  delete: (id: string) => ApiClient.delete(`/word-types/${id}`),
};

// Languages API endpoints
export const languagesApi = {
  getAll: () => ApiClient.get('/languages'),
  getById: (id: string) => ApiClient.get(`/languages/${id}`),
  create: (languageData: { name: string; code: string }) => ApiClient.post('/languages', languageData),
  update: (id: string, languageData: { name: string; code: string }) => ApiClient.put(`/languages/${id}`, languageData),
  delete: (id: string) => ApiClient.delete(`/languages/${id}`),
};

// Language Folders API endpoints
export const languageFoldersApi = {
  getMy: () => ApiClient.get('/language-folders/my'),
  getById: (id: string) => ApiClient.get(`/language-folders/${id}`),
  create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ApiClient.post('/language-folders', languageFolderData),
  update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ApiClient.put(`/language-folders/${id}`, languageFolderData),
  delete: (id: string) => ApiClient.delete(`/language-folders/${id}`),
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

// Export the axios instance for direct use when needed
export { default as axios } from '@/libs/axios';
