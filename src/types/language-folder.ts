export type TLanguageFolder = {
  id: string;
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateLanguageFolder = {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

export type TUpdateLanguageFolder = Partial<TCreateLanguageFolder>;

export type LibrarySortOption = 'recent' | 'name';

export type LibrarySearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'updatedAt' | 'name', sortOrder: 'asc' | 'desc') => void;
  placeholder?: string;
};

export type LibraryHeaderProps = {
  onCreateFolder: () => void;
};

export type LibraryFolderCardProps = {
  folder: TLanguageFolder;
  onClick: (folder: TLanguageFolder) => void;
  onEdit: (folder: TLanguageFolder) => void;
  onDelete: (folderId: string) => void | Promise<void>;
};

export type LibraryEmptyStateProps = {
  searchQuery: string;
  onCreateFolder: () => void;
};

export type LibraryProps = {
  initialData?: import('@/types').ResponseAPI<TLanguageFolder[]>;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};

export type LanguageFolderProps = {
  folder: TLanguageFolder;
  onFolderClick: (folder: TLanguageFolder) => void;
  onFolderUpdated?: () => void;
  onFolderDeleted?: () => void;
};

export type CreateFolderCardProps = {
  onCreateFolder: () => void;
};

export type LanguageFolderFormData = {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

export type LanguageFolderFormErrors = Partial<LanguageFolderFormData>;

export type LanguageFolderFormProps = {
  initialData?: Partial<LanguageFolderFormData>;
  onSubmit: (data: LanguageFolderFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isSubmitting?: boolean;
  showAutoGenerate?: boolean;
  className?: string;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};

export type EditFolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: TLanguageFolder;
  onFolderUpdated?: () => void;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};

export type CreateFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: TCreateLanguageFolder) => Promise<void>;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};
