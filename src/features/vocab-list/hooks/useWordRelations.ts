import type { ResponseAPI } from '@/types';
import type {
  TCreateVocab,
  TVocab,
  TWordRelationsController,
} from '@/types/vocab-list';
import type { TRelatedWordAutocompleteItem } from '@/types/vocab-related-word';
import type { VocabQueryParams } from '@/utils/api-config';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { toast } from 'sonner';
import {
  DEFAULT_RELATION_PENDING_FLAGS,
  getDraftRelationKey,
  mapRelatedWordsToDrafts,
  mapRelationDraftsToPayload,
  mapVocabsToRelationAutocompleteItems,
  normalizeFreeText,
  toggleRelationFlags,
} from '../utils/word-relations';

type TGetVocabsForSelection = (params: Omit<VocabQueryParams, 'userId'>) => Promise<ResponseAPI<TVocab[]> | { error: string }>;

type TWordRelationsState = {
  relationDrafts: TWordRelationsController['relationDrafts'];
  relationInputValue: string;
  relationPendingFlags: TWordRelationsController['relationPendingFlags'];
  editingRelationId: TWordRelationsController['editingRelationId'];
  relationAutocompleteItems: TWordRelationsController['relationAutocompleteItems'];
  relationAutocompleteLoading: TWordRelationsController['relationAutocompleteLoading'];
};

type TWordRelationsAction
  = { type: 'reset-all' }
    | { type: 'set-input'; value: string }
    | { type: 'toggle-pending-flag'; flag: keyof TWordRelationsController['relationPendingFlags'] }
    | { type: 'reset-composer' }
    | { type: 'upsert-draft'; draft: TWordRelationsController['relationDrafts'][number] }
    | { type: 'set-editing-relation'; relationId: string | null }
    | { type: 'toggle-draft-flag'; relationId: string; flag: keyof TWordRelationsController['relationPendingFlags'] }
    | { type: 'remove-draft'; relationId: string }
    | { type: 'set-drafts-from-vocab'; vocab: TVocab | null }
    | { type: 'set-autocomplete-loading'; loading: boolean }
    | { type: 'set-autocomplete-items'; items: TRelatedWordAutocompleteItem[] };

const initialState: TWordRelationsState = {
  relationDrafts: [],
  relationInputValue: '',
  relationPendingFlags: DEFAULT_RELATION_PENDING_FLAGS,
  editingRelationId: null,
  relationAutocompleteItems: [],
  relationAutocompleteLoading: false,
};

function wordRelationsReducer(state: TWordRelationsState, action: TWordRelationsAction): TWordRelationsState {
  switch (action.type) {
    case 'reset-all':
      return initialState;
    case 'set-input':
      return {
        ...state,
        relationInputValue: action.value,
      };
    case 'toggle-pending-flag':
      return {
        ...state,
        relationPendingFlags: toggleRelationFlags(state.relationPendingFlags, action.flag),
      };
    case 'reset-composer':
      return {
        ...state,
        relationInputValue: '',
        relationPendingFlags: DEFAULT_RELATION_PENDING_FLAGS,
        relationAutocompleteItems: [],
        relationAutocompleteLoading: false,
      };
    case 'upsert-draft': {
      const existingIndex = state.relationDrafts.findIndex(
        item => getDraftRelationKey(item) === getDraftRelationKey(action.draft),
      );

      if (existingIndex === -1) {
        return {
          ...state,
          relationDrafts: [...state.relationDrafts, action.draft],
        };
      }

      return {
        ...state,
        relationDrafts: state.relationDrafts.map((relation, index) => {
          if (index !== existingIndex) {
            return relation;
          }

          return {
            ...relation,
            id: relation.id,
            word: action.draft.word,
            linkedVocabId: action.draft.linkedVocabId,
            freeText: action.draft.freeText,
            isSynonym: action.draft.isSynonym,
            isAntonym: action.draft.isAntonym,
            isRelated: action.draft.isRelated,
          };
        }),
      };
    }
    case 'set-editing-relation':
      return {
        ...state,
        editingRelationId: action.relationId,
      };
    case 'toggle-draft-flag': {
      const nextDrafts = state.relationDrafts
        .map((relation) => {
          if (relation.id !== action.relationId) {
            return relation;
          }

          return toggleRelationFlags(relation, action.flag);
        })
        .filter(relation => relation.isSynonym || relation.isAntonym || relation.isRelated);

      return {
        ...state,
        relationDrafts: nextDrafts,
        editingRelationId: nextDrafts.some(relation => relation.id === action.relationId)
          ? state.editingRelationId
          : null,
      };
    }
    case 'remove-draft':
      return {
        ...state,
        relationDrafts: state.relationDrafts.filter(relation => relation.id !== action.relationId),
        editingRelationId: state.editingRelationId === action.relationId ? null : state.editingRelationId,
      };
    case 'set-drafts-from-vocab':
      return {
        ...state,
        relationDrafts: mapRelatedWordsToDrafts(action.vocab?.relatedWords),
        relationInputValue: '',
        relationPendingFlags: DEFAULT_RELATION_PENDING_FLAGS,
        editingRelationId: null,
        relationAutocompleteItems: [],
        relationAutocompleteLoading: false,
      };
    case 'set-autocomplete-loading':
      return {
        ...state,
        relationAutocompleteLoading: action.loading,
      };
    case 'set-autocomplete-items':
      return {
        ...state,
        relationAutocompleteItems: action.items,
      };
    default:
      return state;
  }
}

function validateRelationFlags(flags: TWordRelationsController['relationPendingFlags']) {
  if (!flags.isSynonym && !flags.isAntonym && !flags.isRelated) {
    toast.error('Select at least one relation type.');
    return false;
  }

  if (flags.isSynonym && flags.isAntonym) {
    toast.error('Synonym and Antonym cannot both be selected.');
    return false;
  }

  return true;
}

export function useWordRelations({
  dialogOpen,
  editMode,
  editingItem,
  sourceLanguageCode,
  targetLanguageCode,
  languageFolderId,
  getVocabsForSelection,
}: {
  dialogOpen: boolean;
  editMode: boolean;
  editingItem: TVocab | null | undefined;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
  languageFolderId?: string;
  getVocabsForSelection: TGetVocabsForSelection;
}) {
  const [state, dispatch] = useReducer(wordRelationsReducer, initialState);

  const resetRelations = useCallback(() => {
    dispatch({ type: 'reset-all' });
  }, []);

  const onRelationInputChange = useCallback((value: string) => {
    dispatch({ type: 'set-input', value });
  }, []);

  const onRelationFlagToggle = useCallback((flag: keyof TWordRelationsController['relationPendingFlags']) => {
    dispatch({ type: 'toggle-pending-flag', flag });
  }, []);

  const onOpenRelationEditor = useCallback((relationId: string | null) => {
    dispatch({ type: 'set-editing-relation', relationId });
  }, []);

  const onUpdateRelationFlags = useCallback((relationId: string, flag: keyof TWordRelationsController['relationPendingFlags']) => {
    dispatch({ type: 'toggle-draft-flag', relationId, flag });
  }, []);

  const onRemoveRelation = useCallback((relationId: string) => {
    dispatch({ type: 'remove-draft', relationId });
  }, []);

  const onAddFreeTextRelation = useCallback(() => {
    const normalizedValue = state.relationInputValue.trim();
    if (!normalizedValue) {
      toast.error('Enter a related word first.');
      return;
    }

    if (!validateRelationFlags(state.relationPendingFlags)) {
      return;
    }

    const duplicate = state.relationDrafts.some(
      relation => normalizeFreeText(relation.freeText) === normalizeFreeText(normalizedValue),
    );
    if (duplicate) {
      toast.error('This free-text relation already exists.');
      return;
    }

    dispatch({
      type: 'upsert-draft',
      draft: {
        id: crypto.randomUUID(),
        word: normalizedValue,
        linkedVocabId: null,
        freeText: normalizedValue,
        isSynonym: state.relationPendingFlags.isSynonym,
        isAntonym: state.relationPendingFlags.isAntonym,
        isRelated: state.relationPendingFlags.isRelated,
      },
    });
    dispatch({ type: 'reset-composer' });
  }, [state.relationDrafts, state.relationInputValue, state.relationPendingFlags]);

  const onAddLinkedRelation = useCallback((item: TRelatedWordAutocompleteItem) => {
    if (!validateRelationFlags(state.relationPendingFlags)) {
      return;
    }

    const duplicate = state.relationDrafts.some(relation => relation.linkedVocabId === item.id);
    if (duplicate) {
      toast.error('This linked relation already exists.');
      return;
    }

    dispatch({
      type: 'upsert-draft',
      draft: {
        id: crypto.randomUUID(),
        word: item.sourceText,
        linkedVocabId: item.id,
        freeText: null,
        isSynonym: state.relationPendingFlags.isSynonym,
        isAntonym: state.relationPendingFlags.isAntonym,
        isRelated: state.relationPendingFlags.isRelated,
      },
    });
    dispatch({ type: 'reset-composer' });
  }, [state.relationDrafts, state.relationPendingFlags]);

  useEffect(() => {
    if (!dialogOpen) {
      dispatch({ type: 'reset-all' });
      return;
    }

    if (!editMode || !editingItem) {
      return;
    }

    dispatch({ type: 'set-drafts-from-vocab', vocab: editingItem });
  }, [dialogOpen, editMode, editingItem]);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    const query = state.relationInputValue.trim();
    if (!query) {
      dispatch({ type: 'set-autocomplete-items', items: [] });
      dispatch({ type: 'set-autocomplete-loading', loading: false });
      return;
    }

    let cancelled = false;
    dispatch({ type: 'set-autocomplete-loading', loading: true });

    const timer = window.setTimeout(async () => {
      try {
        const results = await getVocabsForSelection({
          page: 1,
          pageSize: 10,
          sortBy: 'textSource',
          sortOrder: 'asc',
          textSource: query,
          sourceLanguageCode,
          targetLanguageCode,
          languageFolderId,
        });

        if (cancelled) {
          return;
        }

        if ('error' in results) {
          dispatch({ type: 'set-autocomplete-items', items: [] });
          return;
        }

        const filteredResults = results.items.filter((vocab) => {
          if (vocab.textSource.trim().length === 0) {
            return false;
          }

          return vocab.id !== editingItem?.id;
        });

        dispatch({
          type: 'set-autocomplete-items',
          items: mapVocabsToRelationAutocompleteItems(filteredResults),
        });
      } catch {
        if (!cancelled) {
          dispatch({ type: 'set-autocomplete-items', items: [] });
        }
      } finally {
        if (!cancelled) {
          dispatch({ type: 'set-autocomplete-loading', loading: false });
        }
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    dialogOpen,
    editingItem?.id,
    getVocabsForSelection,
    languageFolderId,
    sourceLanguageCode,
    state.relationInputValue,
    targetLanguageCode,
  ]);

  const relationController = useMemo<TWordRelationsController>(() => ({
    relationDrafts: state.relationDrafts,
    relationInputValue: state.relationInputValue,
    relationPendingFlags: state.relationPendingFlags,
    editingRelationId: state.editingRelationId,
    relationAutocompleteItems: state.relationAutocompleteItems,
    relationAutocompleteLoading: state.relationAutocompleteLoading,
    onRelationInputChange,
    onRelationFlagToggle,
    onAddFreeTextRelation,
    onAddLinkedRelation,
    onOpenRelationEditor,
    onUpdateRelationFlags,
    onRemoveRelation,
  }), [
    onAddFreeTextRelation,
    onAddLinkedRelation,
    onOpenRelationEditor,
    onRelationFlagToggle,
    onRelationInputChange,
    onRemoveRelation,
    onUpdateRelationFlags,
    state.editingRelationId,
    state.relationAutocompleteItems,
    state.relationAutocompleteLoading,
    state.relationDrafts,
    state.relationInputValue,
    state.relationPendingFlags,
  ]);

  const relatedWords = useMemo<NonNullable<TCreateVocab['relatedWords']>>(
    () => mapRelationDraftsToPayload(state.relationDrafts),
    [state.relationDrafts],
  );

  return {
    relationController,
    relatedWords,
    resetRelations,
  };
}
