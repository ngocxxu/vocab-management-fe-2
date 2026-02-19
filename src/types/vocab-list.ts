export type TExamples = { source: string; target: string };

export type TTextTargetSubject = {
  id: string;
  subject: { id: string; name: string; order: number };
};

export type TTextTarget = {
  textTarget: string;
  wordType: { id: string; name: string; description: string };
  explanationSource: string;
  explanationTarget: string;
  vocabExamples: TExamples[];
  grammar: string;
  textTargetSubjects: TTextTargetSubject[];
};

export type TVocab = {
  id: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textSource: string;
  textTargets: TTextTarget[];
  masteryScore?: number;
};

export type TCreateVocab = {
  textSource: string;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: [
    {
      wordTypeId: string;
      textTarget: string;
      grammar: string;
      explanationSource: string;
      explanationTarget: string;
      subjectIds: string[];
      vocabExamples: TExamples[];
    },
  ];
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
  vocabExamples: VocabExampleForm[];
};

export type VocabFormData = {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: TextTargetFormItem[];
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
};

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
};

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
};

export type SubjectsSectionProps = {
  targetIndex: number;
  subjects: import('@/types/subject').TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
};

export type VocabListLayoutProps = {
  initialVocabsData?: import('@/types').ResponseAPI<TVocab[]>;
  initialLanguageFolderData?: import('@/types/language-folder').TLanguageFolder;
  initialSubjectsData?: import('@/types/subject').TSubjectResponse;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
  initialWordTypesData?: import('@/types/word-type').TWordTypeResponse;
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
