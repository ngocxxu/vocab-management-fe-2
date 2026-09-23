import type { TVocab } from './vocab-list';

export type TSemanticSearchParams = {
  q: string;
  languageFolderId?: string;
  limit?: number;
};

export type TSemanticSearchGroupedParams = {
  q: string;
  /** Max language folders returned. */
  groupCount?: number;
  /** Max vocabs shown inside each folder. */
  groupSize?: number;
};

/**
 * One language folder's slice of a cross-folder search — mirrors the backend's
 * VocabSearchGroupDto. Results arrive bucketed rather than as one ranked list
 * because multilingual embeddings rank same-language and English matches higher,
 * which would let a single folder take nearly every slot.
 */
export type TVocabSearchGroup = {
  languageFolderId: string;
  /** Null when the folder was deleted or the name lookup failed — fall back to the language pair label. */
  languageFolderName: string | null;
  vocabs: TVocab[];
};
