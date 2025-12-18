import type { AxiosRequestConfig } from 'axios';
import type { LanguageFolderQueryParams, VocabQueryParams, VocabTrainerQueryParams } from './api-config';
import type { ResponseAPI, TLanguage, TLanguageFolder } from '@/types';
import type { TAuthResponse } from '@/types/auth';
import type {
  TDeleteNotificationResponse,
  TMarkAllAsReadResponse,
  TMarkAsReadResponse,
  TNotification,
  TNotificationInput,
  TUnreadCountResponse,
  TUpdateNotificationStatusInput,
} from '@/types/notification';
import type {
  MasteryBySubject,
  MasteryDistribution,
  MasterySummary,
  ProgressOverTime,
  TopProblematicVocab,
} from '@/types/statistics';
import type { TCreateVocab, TCsvImportResponse, TVocab } from '@/types/vocab-list';
import type {
  TCreateVocabTrainer,
  TFormTestVocabTrainerUnion,
  TQuestionAPI,
  TVocabTrainer,
} from '@/types/vocab-trainer';
import type { TWordTypeResponse } from '@/types/word-type';
import axiosInstance from '@/libs/axios';
import { API_METHODS } from './api-config';

// Generic API client with common methods
export class ClientAPI {
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
  signin: (data: { email: string; password: string }) => {
    const config = API_METHODS.auth.signin(data);
    return ClientAPI.post<TAuthResponse>(config.endpoint, config.data);
  },
  signup: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; avatar: string; role: string }) => {
    const config = API_METHODS.auth.signup(data);
    return ClientAPI.post<TAuthResponse>(config.endpoint, config.data);
  },
  refresh: (data: { refreshToken: string }) => {
    const config = API_METHODS.auth.refresh(data);
    return ClientAPI.post(config.endpoint, config.data);
  },
  signout: () => {
    const config = API_METHODS.auth.signout();
    return ClientAPI.post(config.endpoint);
  },
  resetPassword: (data: { email: string }) => {
    const config = API_METHODS.auth.resetPassword(data);
    return ClientAPI.post(config.endpoint, config.data);
  },
  verify: () => {
    const config = API_METHODS.auth.verify();
    return ClientAPI.get(config.endpoint);
  },
};

// Vocabulary Management API endpoints
export const vocabApi = {
  getAll: (params?: VocabQueryParams) => {
    const config = API_METHODS.vocabs.getAll(params);
    return ClientAPI.get<ResponseAPI<TVocab[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabs.getById(id);
    return ClientAPI.get<TVocab>(config.endpoint);
  },
  create: (vocabData: TCreateVocab) => {
    const config = API_METHODS.vocabs.create(vocabData);
    return ClientAPI.post<TVocab>(config.endpoint, config.data);
  },
  update: (id: string, vocabData: Partial<TCreateVocab>) => {
    const config = API_METHODS.vocabs.update(id, vocabData);
    return ClientAPI.put<TVocab>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.vocabs.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
  createBulk: (vocabData: TCreateVocab[]) => {
    const config = API_METHODS.vocabs.createBulk(vocabData);
    return ClientAPI.post(config.endpoint, config.data);
  },
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabs.deleteBulk(ids);
    return ClientAPI.post(config.endpoint, config.data);
  },
  importCsv: (file: File, params: { languageFolderId: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.vocabs.importCsv(params);
    const formData = new FormData();
    formData.append('file', file);
    return ClientAPI.post<TCsvImportResponse>(config.endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes to match backend timeout
    });
  },
};

// Statistics API endpoints
export const statisticsApi = {
  getSummary: () => {
    const config = API_METHODS.vocabs.getStatisticsSummary();
    return ClientAPI.get<MasterySummary>(config.endpoint);
  },
  getBySubject: () => {
    const config = API_METHODS.vocabs.getStatisticsBySubject();
    return ClientAPI.get<MasteryBySubject[]>(config.endpoint);
  },
  getProgress: (params?: { startDate?: string; endDate?: string }) => {
    const config = API_METHODS.vocabs.getStatisticsProgress(params);
    return ClientAPI.get<ProgressOverTime[]>(config.endpoint);
  },
  getProblematic: (params?: { minIncorrect?: number; limit?: number }) => {
    const config = API_METHODS.vocabs.getStatisticsProblematic(params);
    return ClientAPI.get<TopProblematicVocab[]>(config.endpoint);
  },
  getDistribution: () => {
    const config = API_METHODS.vocabs.getStatisticsDistribution();
    return ClientAPI.get<MasteryDistribution[]>(config.endpoint);
  },
};

// Vocabulary Trainer API endpoints
export const vocabTrainerApi = {
  getAll: (params?: VocabTrainerQueryParams) => {
    const config = API_METHODS.vocabTrainers.getAll(params);
    return ClientAPI.get<ResponseAPI<TVocabTrainer[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.vocabTrainers.getById(id);
    return ClientAPI.get<TVocabTrainer>(config.endpoint);
  },
  create: (trainerData: TCreateVocabTrainer) => {
    const config = API_METHODS.vocabTrainers.create(trainerData);
    return ClientAPI.post<TVocabTrainer>(config.endpoint, config.data);
  },
  update: (id: string, trainerData: Partial<TCreateVocabTrainer>) => {
    const config = API_METHODS.vocabTrainers.update(id, trainerData);
    return ClientAPI.put<TVocabTrainer>(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.vocabTrainers.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
  getExam: (id: string) => {
    const config = API_METHODS.vocabTrainers.getExam(id);
    return ClientAPI.get<TQuestionAPI>(config.endpoint);
  },
  submitExam: (id: string, testData: TFormTestVocabTrainerUnion) => {
    const config = API_METHODS.vocabTrainers.submitExam(id, testData);
    return ClientAPI.patch(config.endpoint, config.data);
  },
  deleteBulk: (ids: string[]) => {
    const config = API_METHODS.vocabTrainers.deleteBulk(ids);
    return ClientAPI.post(config.endpoint, config.data);
  },
};

// Subjects API endpoints
export const subjectsApi = {
  getAll: () => {
    const config = API_METHODS.subjects.getAll();
    return ClientAPI.get<{ items: any[]; statusCode: number }>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.subjects.getById(id);
    return ClientAPI.get(config.endpoint);
  },
  create: (subjectData: { name: string }) => {
    const config = API_METHODS.subjects.create(subjectData);
    return ClientAPI.post(config.endpoint, config.data);
  },
  update: (id: string, subjectData: { name: string; order: number }) => {
    const config = API_METHODS.subjects.update(id, subjectData);
    return ClientAPI.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.subjects.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
  reorder: (subjects: { id: string; order: number }[]) => {
    const config = API_METHODS.subjects.reorder(subjects);
    return ClientAPI.patch(config.endpoint, config.data);
  },
};

// Word Types API endpoints
export const wordTypesApi = {
  getAll: () => {
    const config = API_METHODS.wordTypes.getAll();
    return ClientAPI.get<TWordTypeResponse>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.wordTypes.getById(id);
    return ClientAPI.get(config.endpoint);
  },
  create: (wordTypeData: { name: string; description: string }) => {
    const config = API_METHODS.wordTypes.create(wordTypeData);
    return ClientAPI.post(config.endpoint, config.data);
  },
  update: (id: string, wordTypeData: { name: string; description: string }) => {
    const config = API_METHODS.wordTypes.update(id, wordTypeData);
    return ClientAPI.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.wordTypes.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
};

// Languages API endpoints
export const languagesApi = {
  getAll: () => {
    const config = API_METHODS.languages.getAll();
    return ClientAPI.get<ResponseAPI<TLanguage[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.languages.getById(id);
    return ClientAPI.get<TLanguage>(config.endpoint);
  },
  create: (languageData: { name: string; code: string }) => {
    const config = API_METHODS.languages.create(languageData);
    return ClientAPI.post(config.endpoint, config.data);
  },
  update: (id: string, languageData: { name: string; code: string }) => {
    const config = API_METHODS.languages.update(id, languageData);
    return ClientAPI.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.languages.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
};

// Language Folders API endpoints
export const languageFoldersApi = {
  getMy: (params?: LanguageFolderQueryParams) => {
    const config = API_METHODS.languageFolders.getMy(params);
    return ClientAPI.get<ResponseAPI<TLanguageFolder[]>>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.languageFolders.getById(id);
    return ClientAPI.get<TLanguageFolder>(config.endpoint);
  },
  create: (languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.create(languageFolderData);
    return ClientAPI.post(config.endpoint, config.data);
  },
  update: (id: string, languageFolderData: { name: string; folderColor: string; sourceLanguageCode: string; targetLanguageCode: string }) => {
    const config = API_METHODS.languageFolders.update(id, languageFolderData);
    return ClientAPI.put(config.endpoint, config.data);
  },
  delete: (id: string) => {
    const config = API_METHODS.languageFolders.delete(id);
    return ClientAPI.delete(config.endpoint);
  },
};

// Notifications API endpoints
export const notificationsApi = {
  getMy: () => {
    const config = API_METHODS.notifications.getMy();
    return ClientAPI.get<ResponseAPI<TNotification[]>>(config.endpoint);
  },
  getUnread: () => {
    const config = API_METHODS.notifications.getUnread();
    return ClientAPI.get<ResponseAPI<TNotification[]>>(config.endpoint);
  },
  getUnreadCount: () => {
    const config = API_METHODS.notifications.getUnreadCount();
    return ClientAPI.get<TUnreadCountResponse>(config.endpoint);
  },
  markAsRead: (id: string) => {
    const config = API_METHODS.notifications.markAsRead(id);
    return ClientAPI.patch<TMarkAsReadResponse>(config.endpoint, {});
  },
  markAllAsRead: () => {
    const config = API_METHODS.notifications.markAllAsRead();
    return ClientAPI.patch<TMarkAllAsReadResponse>(config.endpoint, {});
  },
  delete: (id: string) => {
    const config = API_METHODS.notifications.delete(id);
    return ClientAPI.delete<TDeleteNotificationResponse>(config.endpoint);
  },
  getById: (id: string) => {
    const config = API_METHODS.notifications.getById(id);
    return ClientAPI.get<TNotification>(config.endpoint);
  },
  create: (notificationData: TNotificationInput) => {
    const config = API_METHODS.notifications.create(notificationData);
    return ClientAPI.post<TNotification>(config.endpoint, config.data);
  },
  update: (id: string, notificationData: Partial<TNotificationInput>) => {
    const config = API_METHODS.notifications.update(id, notificationData);
    return ClientAPI.put<TNotification>(config.endpoint, config.data);
  },
  updateStatus: (id: string, statusData: TUpdateNotificationStatusInput) => {
    const config = API_METHODS.notifications.updateStatus(id, statusData);
    return ClientAPI.patch<TNotification>(config.endpoint, config.data);
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
  statistics: statisticsApi,
};

// Export the axios instance for direct use when needed
export { default as axios } from '@/libs/axios';
