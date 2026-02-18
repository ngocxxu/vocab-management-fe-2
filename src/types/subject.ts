export type TSubject = {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TCreateSubject = {
  name: string;
};

export type TUpdateSubject = {
  name?: string;
  order?: number;
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
};

export type SubjectsPaginationProps = Readonly<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}>;

export type SubjectSectionProps = {
  initialSubjectsData?: TSubjectResponse;
};
