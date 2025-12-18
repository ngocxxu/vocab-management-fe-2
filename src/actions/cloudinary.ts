'use server';

import type { GenerateUploadSignatureInput, GenerateUploadSignatureOutput } from '@/types/cloudinary';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';

export async function getCloudinaryUploadSignature(
  params?: GenerateUploadSignatureInput,
): Promise<GenerateUploadSignatureOutput | { error: string }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.folder) {
      queryParams.append('folder', params.folder);
    }
    if (params?.uploadPreset) {
      queryParams.append('uploadPreset', params.uploadPreset);
    }
    if (params?.resourceType) {
      queryParams.append('resourceType', params.resourceType);
    }
    if (params?.maxFileSize) {
      queryParams.append('maxFileSize', params.maxFileSize.toString());
    }

    const queryString = queryParams.toString();
    const backendUrl = `${Env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}/cloudinary/upload-signature${queryString ? `?${queryString}` : ''}`;

    const cookieStore = await cookies();
    const authCookie = cookieStore.get('accessToken') || cookieStore.get('token');
    const bearerToken = authCookie?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieStore.toString(),
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend cloudinary signature failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return {
        error: `Backend signature request failed: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();
    return result as GenerateUploadSignatureOutput;
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get upload signature',
    };
  }
}
