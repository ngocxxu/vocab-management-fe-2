export type TBackendErrorResponse = {
  error?: string;
  message?: string;
  statusCode?: number;
  [key: string]: unknown;
};

export function getBackendAuthUrl(endpoint: string): string {
  return `${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}${endpoint}`;
}

export async function parseBackendResponse<T>(response: Response): Promise<T | TBackendErrorResponse> {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as T | TBackendErrorResponse;
  } catch {
    return { error: responseText };
  }
}
