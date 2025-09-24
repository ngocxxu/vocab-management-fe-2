import type { EQuestionType, EVocabTrainerStatus } from '@/enum/vocab-trainer';

export type TOption = { label: string; value: string };

export type ResponseAPI<T> = { items: T } & TPagination;

export type TPagination = {
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export type TPage = {
  page: string;
  pageSize: string;
  sortBy?: string;
  sortOrder?: string;
};

export type TVocabQuery = {
  textSource?: string;
  subjectIds?: string[];
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
} & TPage;

export type TVocabTrainerQuery = {
  name?: string;
  status?: EVocabTrainerStatus;
  questionType?: EQuestionType;
} & TPage;

export enum EUserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// Export auth types
export * from './auth';

// Export language folder types
export * from './language-folder';
