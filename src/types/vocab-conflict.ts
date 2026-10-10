import type { ETrainerMode } from '@/enum/vocab-trainer';
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

/** A delete the backend refused because the word (or words) are still in a trainer. */
export type TVocabInUse = { kind: 'single'; trainerCount: number } | { kind: 'bulk'; blockedCount: number };

/** Result of deleting one or more words: refused with the conflict, or deleted. */
export type TDeleteVocabResult = { ok: true } | { ok: false; conflict: TVocabInUse };

export type TVocabTrainerConflict = {
  vocabId: string;
  textSource: string;
  trainers: Array<{ id: string; name: string; mode: ETrainerMode }>;
};
