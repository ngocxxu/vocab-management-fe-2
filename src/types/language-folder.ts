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
