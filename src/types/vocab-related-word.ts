export type TRelatedWordItem = {
  id: string;
  linkedVocabId: string | null;
  freeText: string | null;
  word: string;
  isSynonym: boolean;
  isAntonym: boolean;
  isRelated: boolean;
};

export type TRelatedWordsGroupedResponse = {
  synonyms: TRelatedWordItem[];
  antonyms: TRelatedWordItem[];
  related: TRelatedWordItem[];
};

export type TReplaceRelatedWordLinkedEntry = {
  linkedVocabId: string;
  freeText?: never;
  isSynonym: boolean;
  isAntonym: boolean;
  isRelated: boolean;
};

export type TReplaceRelatedWordFreeTextEntry = {
  linkedVocabId?: never;
  freeText: string;
  isSynonym: boolean;
  isAntonym: boolean;
  isRelated: boolean;
};

export type TReplaceRelatedWordEntry
  = TReplaceRelatedWordLinkedEntry
    | TReplaceRelatedWordFreeTextEntry;

export type TReplaceRelatedWordsInput = {
  words: TReplaceRelatedWordEntry[];
};

export type TRelatedWordAutocompleteItem = {
  id: string;
  sourceText: string;
};
