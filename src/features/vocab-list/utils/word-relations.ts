import type {
  TCreateVocab,
  TVocab,
  TWordRelationDraft,
  TWordRelationPendingFlags,
} from '@/types/vocab-list';
import type { TRelatedWordAutocompleteItem } from '@/types/vocab-related-word';

export const DEFAULT_RELATION_PENDING_FLAGS: TWordRelationPendingFlags = {
  isSynonym: false,
  isAntonym: false,
  isRelated: false,
};

export function normalizeFreeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export function getDraftRelationKey(relation: {
  linkedVocabId: string | null;
  freeText: string | null;
}) {
  if (relation.linkedVocabId) {
    return `linked:${relation.linkedVocabId}`;
  }

  return `free:${normalizeFreeText(relation.freeText)}`;
}

export function toggleRelationFlags<T extends TWordRelationPendingFlags>(flags: T, flag: keyof TWordRelationPendingFlags): T {
  if (flag === 'isSynonym') {
    const nextValue = !flags.isSynonym;
    return {
      ...flags,
      isSynonym: nextValue,
      isAntonym: nextValue ? false : flags.isAntonym,
    };
  }

  if (flag === 'isAntonym') {
    const nextValue = !flags.isAntonym;
    return {
      ...flags,
      isAntonym: nextValue,
      isSynonym: nextValue ? false : flags.isSynonym,
    };
  }

  return {
    ...flags,
    isRelated: !flags.isRelated,
  };
}

export function mapRelatedWordsToDrafts(data: TVocab['relatedWords']): TWordRelationDraft[] {
  if (!data) {
    return [];
  }

  const relations = Array.isArray(data)
    ? data
    : [...data.synonyms, ...data.antonyms, ...data.related];

  return relations.reduce<TWordRelationDraft[]>((drafts, relation) => {
    const relationKey = getDraftRelationKey(relation);
    const existingDraft = drafts.find(draft => getDraftRelationKey(draft) === relationKey);

    if (!existingDraft) {
      return [
        ...drafts,
        {
          id: crypto.randomUUID(),
          word: relation.word,
          linkedVocabId: relation.linkedVocabId,
          freeText: relation.freeText,
          isSynonym: relation.isSynonym,
          isAntonym: relation.isAntonym,
          isRelated: relation.isRelated,
        },
      ];
    }

    return drafts.map((draft) => {
      if (draft.id !== existingDraft.id) {
        return draft;
      }

      return {
        ...draft,
        isSynonym: draft.isSynonym || relation.isSynonym,
        isAntonym: draft.isAntonym || relation.isAntonym,
        isRelated: draft.isRelated || relation.isRelated,
      };
    });
  }, []);
}

export function mapVocabsToRelationAutocompleteItems(vocabs: TVocab[]): TRelatedWordAutocompleteItem[] {
  return vocabs.map(vocab => ({
    id: vocab.id,
    sourceText: vocab.textSource,
  }));
}

export function mapRelationDraftsToPayload(relationDrafts: TWordRelationDraft[]): NonNullable<TCreateVocab['relatedWords']> {
  return relationDrafts.map((relation) => {
    if (relation.linkedVocabId) {
      return {
        linkedVocabId: relation.linkedVocabId,
        isSynonym: relation.isSynonym,
        isAntonym: relation.isAntonym,
        isRelated: relation.isRelated,
      };
    }

    return {
      freeText: relation.freeText ?? relation.word,
      isSynonym: relation.isSynonym,
      isAntonym: relation.isAntonym,
      isRelated: relation.isRelated,
    };
  });
}
