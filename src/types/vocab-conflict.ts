import type { TVocab } from '@/types/vocab-list';

export type TVocabConflictListResponse = {
  items: TVocab[];
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
