export type TSubject = {
  id: string;
  name: string;
  order: number;
  targetLanguageCode?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TCreateSubject = {
  name: string;
  targetLanguageCode: string;
};

export type TUpdateSubject = {
  name?: string;
  order?: number;
  targetLanguageCode?: string;
};

export type TSubjectResponse = {
  items: TSubject[];
  statusCode: number;
};

export type SubjectTableRowProps = {
  subject: TSubject;
  index: number;
  onEdit: (subject: TSubject) => void;
  onDelete: (id: string) => void;
};

export type SubjectFormProps = {
  subject?: TSubject | null;
  onSubmit: (data: TCreateSubject) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};

export type SubjectsPaginationProps = Readonly<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}>;

export type SubjectSectionProps = {
  initialSubjectsData?: TSubjectResponse;
  initialLanguagesData?: import('@/types').ResponseAPI<import('@/types').TLanguage[]>;
};

export type TSubjectGenerateResult = {
  jobId: string;
  textTarget: string;
  result: {
    totalCount: number;
    matchingExisting: Array<{ id: string; name: string }>;
    newCreativeIdeas: Array<{ name: string }>;
  };
  timestamp: string;
};
