export type TWordType = {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TCreateWordType = {
  name: string;
  description: string;
};

export type TUpdateWordType = Partial<TCreateWordType>;

export type TWordTypeResponse = {
  items: TWordType[];
  statusCode: number;
};
