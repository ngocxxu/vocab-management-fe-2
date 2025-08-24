import type { AxiosRequestConfig } from 'axios';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type {
  TCreateVocabTrainer,
  TFormTestVocabTrainer,
  TQuestionAPI,
  TVocabTrainer,
} from '@/types/vocab-trainer';
import axiosInstance from '@/libs/axios';

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

// Vocabulary Management API endpoints
export const vocabApi = {
  // Get all vocabularies
  getAll: () => ApiClient.get<TVocab[]>('/vocabs'),

  // Get vocabulary by ID
  getById: (id: string) => ApiClient.get<TVocab>(`/vocabs/${id}`),

  // Create new vocabulary
  create: (vocabData: TCreateVocab) => ApiClient.post<TVocab>('/vocabs', vocabData),

  // Update vocabulary
  update: (id: string, vocabData: Partial<TCreateVocab>) => ApiClient.put<TVocab>(`/vocabs/${id}`, vocabData),

  // Delete vocabulary
  delete: (id: string) => ApiClient.delete(`/vocabs/${id}`),

  // Search vocabularies
  search: (query: string) => ApiClient.get<TVocab[]>('/vocabs', {
    params: { q: query },
  }),

  // Create bulk vocabularies
  createBulk: (vocabData: TCreateVocab[]) => ApiClient.post(`/vocabs/bulk/create`, { data: { vocabData } }),

  // Delete bulk vocabularies
  deleteBulk: (ids: string[]) => ApiClient.post(`/vocabs/bulk/delete`, { data: { ids } }),
};

// Vocabulary Trainer API endpoints
export const vocabTrainerApi = {
  // Get all vocab trainers
  getAll: () => ApiClient.get<TVocabTrainer[]>('/vocab-trainers'),

  // Get vocab trainer by ID
  getById: (id: string) => ApiClient.get<TVocabTrainer>(`/vocab-trainers/${id}`),

  // Create new vocab trainer
  create: (trainerData: TCreateVocabTrainer) => ApiClient.post<TVocabTrainer>('/vocab-trainers', trainerData),

  // Delete vocab trainer
  delete: (id: string) => ApiClient.delete(`/vocab-trainers/${id}`),

  // Get questions for a trainer
  getExam: (id: string) => ApiClient.get<TQuestionAPI>(`/vocab-trainers/${id}/exam`),

  // Submit test results
  submitExam: (id: string, testData: TFormTestVocabTrainer) => ApiClient.patch(`/vocab-trainers/${id}/exam`, testData),

  // Delete bulk vocab trainers
  deleteBulk: (ids: string[]) => ApiClient.post(`/vocab-trainers/bulk/delete`, { data: { ids } }),
};

// Subjects API endpoints
export const subjectsApi = {
  // Get all subjects
  getAll: () => ApiClient.get('/subjects'),

  // Get subject by ID
  getById: (id: string) => ApiClient.get(`/subjects/${id}`),

  // Create new subject
  create: (subjectData: { name: string; order: number }) => ApiClient.post('/subjects', subjectData),

  // Update subject
  update: (id: string, subjectData: { name: string; order: number }) => ApiClient.put(`/subjects/${id}`, subjectData),

  // Delete subject
  delete: (id: string) => ApiClient.delete(`/subjects/${id}`),

  // Reorder subjects
  reorder: (subjectIds: string[]) => ApiClient.post('/subjects/reorder', subjectIds),
};

// Word Types API endpoints
export const wordTypesApi = {
  // Get all word types
  getAll: () => ApiClient.get('/word-types'),

  // Get word type by ID
  getById: (id: string) => ApiClient.get(`/word-types/${id}`),

  // Create new word type
  create: (wordTypeData: { name: string; description: string }) => ApiClient.post('/word-types', wordTypeData),

  // Update word type
  update: (id: string, wordTypeData: { name: string; description: string }) => ApiClient.put(`/word-types/${id}`, wordTypeData),

  // Delete word type
  delete: (id: string) => ApiClient.delete(`/word-types/${id}`),
};

// Languages API endpoints
export const languagesApi = {
  // Get all languages
  getAll: () => ApiClient.get('/languages'),

  // Get language by ID
  getById: (id: string) => ApiClient.get(`/languages/${id}`),

  // Create new language
  create: (languageData: { name: string; code: string }) => ApiClient.post('/languages', languageData),

  // Update language
  update: (id: string, languageData: { name: string; code: string }) => ApiClient.put(`/languages/${id}`, languageData),

  // Delete language
  delete: (id: string) => ApiClient.delete(`/languages/${id}`),
};

// Language Folders API endpoints
export const languageFoldersApi = {
  // Get my language folders
  getMy: () => ApiClient.get('/language-folders/my'),

  // Get language folder by ID
  getById: (id: string) => ApiClient.get(`/language-folders/${id}`),

  // Create new language folder
  create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ApiClient.post('/language-folders', languageFolderData),

  // Update language folder
  update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => ApiClient.put(`/language-folders/${id}`, languageFolderData),

  // Delete language folder
  delete: (id: string) => ApiClient.delete(`/language-folders/${id}`),
};

// Main API object for easy access
export const api = {
  vocab: vocabApi,
  vocabTrainer: vocabTrainerApi,
  subjects: subjectsApi,
  wordTypes: wordTypesApi,
  languages: languagesApi,
};

// Export the axios instance for direct use when needed
export { default as axios } from '@/libs/axios';
