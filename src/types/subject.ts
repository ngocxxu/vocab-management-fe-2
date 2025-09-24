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
