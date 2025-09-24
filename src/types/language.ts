export type TLanguage = {
  id: string;
  name: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TCreateLanguage = {
  name: string;
  code: string;
};

export type TUpdateLanguage = Partial<TCreateLanguage>;
