import type { TLanguageFolder } from './language-folder';

export type TApiKeyScope = 'QUICK_ADD_VOCAB';

export type TApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: TApiKeyScope[];
  languageFolderId: string | null;
  languageFolder?: TLanguageFolder;
  createdAt: string;
  lastUsedAt: string | null;
};

export type TCreateApiKeyResponse = TApiKey & {
  key: string;
};

export type TCreateApiKey = {
  name: string;
  scopes: TApiKeyScope[];
  languageFolderId?: string;
};

export type TApiKeyResponse = {
  items: TApiKey[];
  statusCode: number;
};

export type ApiKeySectionProps = {
  initialApiKeysData?: TApiKeyResponse;
};

export type ApiKeyFormProps = {
  onSubmit: (data: TCreateApiKey) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
};

export type ApiKeyTableRowProps = {
  apiKey: TApiKey;
  onDelete: (id: string) => void;
};
