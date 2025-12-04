import { cloudinaryApi } from '@/utils/client-api';

export type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type CloudinaryUploadOptions = {
  folder?: string;
  resourceType?: 'audio' | 'video' | 'image' | 'raw';
  maxFileSize?: number;
};

const normalizeResourceType = (resourceType: string): 'raw' | 'video' | 'image' => {
  if (resourceType === 'audio') {
    return 'raw';
  }
  if (resourceType === 'raw' || resourceType === 'video' || resourceType === 'image') {
    return resourceType;
  }
  return 'raw';
};

export const uploadAudioToCloudinary = async (
  audioBlob: Blob,
  options?: Partial<CloudinaryUploadOptions>,
): Promise<string> => {
  const inputResourceType = options?.resourceType || 'audio';
  const maxFileSize = options?.maxFileSize;
  const uploadPreset = 'vocab';

  const cloudinaryResourceType = normalizeResourceType(inputResourceType);

  try {
    const signatureData = await cloudinaryApi.getUploadSignature({
      uploadPreset,
      resourceType: cloudinaryResourceType,
      maxFileSize,
    });

    const { signature, timestamp, cloudName, apiKey, uploadPreset: signedUploadPreset, resourceType: signedResourceType } = signatureData;

    if (!signature || !timestamp || !cloudName || !apiKey) {
      throw new Error('Invalid signature data received from server');
    }

    const normalizedSignedResourceType = normalizeResourceType(signedResourceType);
    const presetToUse = signedUploadPreset || uploadPreset;

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('signature', signature);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('upload_preset', presetToUse);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${normalizedSignedResourceType}/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Cloudinary upload failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`,
      );
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    return data.public_id;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload audio to Cloudinary');
  }
};
