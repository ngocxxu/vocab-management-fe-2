export type GenerateUploadSignatureInput = {
  folder?: string;
  uploadPreset?: string;
  resourceType?: 'audio' | 'video' | 'image' | 'raw';
  maxFileSize?: number;
};

export type GenerateUploadSignatureOutput = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder?: string;
  uploadPreset?: string;
  resourceType: string;
  maxFileSize: number;
};
