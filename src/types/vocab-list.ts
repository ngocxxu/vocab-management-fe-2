import type {
  TRelatedWordAutocompleteItem,
  TRelatedWordItem,
  TRelatedWordsGroupedResponse,
  TReplaceRelatedWordEntry,
} from './vocab-related-word';

export type TExamples = { source: string; target: string };

export type TTextTargetSubject = {
  id: string;
  subject: { id: string; name: string; order?: number };
};

export type TTextTarget = {
  id: string;
  vocabId: string;
  wordTypeId: string | null;
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  createdAt: string;
  updatedAt: string;
  wordType: { id: string; name: string; description: string } | null;
  vocabExamples: TExamples[];
  textTargetSubjects: TTextTargetSubject[];
};

export type TCreateTextTarget = {
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  wordTypeId?: string;
  subjects: Array<{ id: string } | { name: string }>;
  vocabExamples: TExamples[];
};

export type TUpdateTextTarget = Partial<TCreateTextTarget>;

export type TVocab = {
  id: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textSource: string;
  textTargets: TTextTarget[];
  relatedWords?: TRelatedWordItem[] | TRelatedWordsGroupedResponse;
  languageFolderId?: string;
  masteryScore?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateVocab = {
  textSource: string;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  relatedWords?: TReplaceRelatedWordEntry[];
  textTargets: [
    {
      wordTypeId: string;
      textTarget: string;
      grammar: string;
      explanationSource: string;
      explanationTarget: string;
      subjects: Array<{ id: string } | { name: string }>;
      vocabExamples: TExamples[];
    },
  ];
};

export type TBulkVocabUpdateItem = {
  id: string;
  data: Partial<TCreateVocab>;
};

export type TCsvImportResponse = {
  created: number;
  updated: number;
  failed: number;
  totalProcessed: number;
  errors?: Array<{
    row: number;
    error: string;
    data: Record<string, unknown>;
  }>;
};

export type VocabExampleForm = {
  id: string;
  source: string;
  target: string;
};

export type TextTargetFormItem = {
  id: string;
  wordTypeId?: string;
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  subjectIds: string[];
  pendingSubjectNames: string[];
  vocabExamples: VocabExampleForm[];
};

export type VocabFormData = {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: TextTargetFormItem[];
};

export type TWordRelationDraft = {
  id: string;
  word: string;
  linkedVocabId: string | null;
  freeText: string | null;
  isSynonym: boolean;
  isAntonym: boolean;
  isRelated: boolean;
};

export type TWordRelationPendingFlags = {
  isSynonym: boolean;
  isAntonym: boolean;
  isRelated: boolean;
};

export type TWordRelationsController = {
  relationDrafts: TWordRelationDraft[];
  relationInputValue: string;
  relationPendingFlags: TWordRelationPendingFlags;
  editingRelationId: string | null;
  relationAutocompleteItems: TRelatedWordAutocompleteItem[];
  relationAutocompleteLoading: boolean;
  onRelationInputChange: (value: string) => void;
  onRelationFlagToggle: (flag: keyof TWordRelationPendingFlags) => void;
  onAddFreeTextRelation: () => void;
  onAddLinkedRelation: (item: TRelatedWordAutocompleteItem) => void;
  onOpenRelationEditor: (relationId: string | null) => void;
  onUpdateRelationFlags: (relationId: string, flag: keyof TWordRelationPendingFlags) => void;
  onRemoveRelation: (relationId: string) => void;
  hasInvalidRelationDrafts: boolean;
};

export type AddVocabDialogProps = {
  formData: VocabFormData;
  activeTab: string;
  onInputChange: (field: string, value: string, targetIndex?: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
  onAddTextTarget: () => void;
  onRemoveTextTarget: (index: number) => void;
  onActiveTabChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode?: boolean;
  editingItem?: TVocab | null;
  initialSubjectsData?: import('@/types/subject').TSubjectResponse;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
  initialWordTypesData?: import('@/types/word-type').TWordTypeResponse;
  userRole?: string;
} & TWordRelationsController;

export type ImportVocabDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  onImportSuccess: () => void;
};

export type VocabLanguageFormProps = {
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
  editMode?: boolean;
} & TWordRelationsController;

export type WordRelationsSectionProps = {
  editMode?: boolean;
} & TWordRelationsController;

export type TextTargetTabsProps = {
  variant?: 'default' | 'sidebar' | 'content';
  textTargets: TextTargetFormItem[];
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  onInputChange?: (field: string, value: string, targetIndex?: number) => void;
  onExampleChange?: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample?: (targetIndex: number) => void;
  onRemoveExample?: (exampleIndex: number, targetIndex: number) => void;
  onAddTextTarget?: () => void;
  onRemoveTextTarget?: (index: number) => void;
  textSource?: string;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
  readOnly?: boolean;
  initialSubjectsData?: import('@/types/subject').TSubjectResponse;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
  initialWordTypesData?: import('@/types/word-type').TWordTypeResponse;
  userRole?: string;
};

export type WordTypeItem = {
  id: string;
  name: string;
  description: string;
};

export type TextTargetFormProps = {
  targetIndex: number;
  target: TextTargetFormItem;
  wordTypes: WordTypeItem[];
  isLoading: boolean;
  isError: boolean;
  subjects: import('@/types/subject').TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  onInputChange: (field: string, value: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
  userRole?: string;
};

export type ExamplesSectionProps = {
  targetIndex: number;
  examples: VocabExampleForm[];
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
};

export type ExpandedRowContentProps = {
  vocab: TVocab;
  columnsCount: number;
  className?: string;
  showGrammar?: boolean;
  showExplanations?: boolean;
  showSubjects?: boolean;
  showExamples?: boolean;
  onCollapse?: () => void;
  onEdit?: (vocab: TVocab, textTargetIndex?: number) => void;
  onLinkedWordClick?: (word: string) => void;
  onAddFreeTextWord?: (word: string) => void;
};

export type SubjectsSectionProps = {
  targetId: string;
  targetIndex: number;
  subjectIds: string[];
  subjects: import('@/types/subject').TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
  targetLanguageCode: string;
  textTarget: string;
};

export type VocabListLayoutProps = {
  initialVocabsData?: import('@/types').ResponseAPI<TVocab[]>;
  initialLanguageFolderData?: import('@/types/language-folder').TLanguageFolder;
  initialSubjectsData?: import('@/types/subject').TSubjectResponse;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
  initialWordTypesData?: import('@/types/word-type').TWordTypeResponse;
  currentUser?: import('@/types/auth').TUser | null;
  vocabListLoadFailed?: boolean;
};

export type VocabListContentProps = VocabListLayoutProps;

export type VocabListProps = VocabListLayoutProps;

export type VocabListHeaderProps = {
  totalCount: number;
  onAddVocab: () => void;
  onImportExcel: () => void;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  languageFolder?: import('@/types/language-folder').TLanguageFolder;
  isFolderLoading?: boolean;
  subjects: Array<{ id: string; name: string }>;
  isSubjectsLoading: boolean;
  selectedSubjectIds: string[];
  onSubjectFilterChange: (subjectIds: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  queryParams: import('@/utils/api-config').VocabQueryParams;
  userRole?: string;
};

export type ExportExcelButtonProps = {
  queryParams: import('@/utils/api-config').VocabQueryParams;
  disabled?: boolean;
};

export type ExportCsvButtonProps = {
  queryParams: import('@/utils/api-config').VocabQueryParams;
  disabled?: boolean;
};
