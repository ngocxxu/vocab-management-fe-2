export type TBackendErrorResponse = {
  error?: string;
  message?: string;
  statusCode?: number;
  [key: string]: unknown;
};

const BACKEND_TIMEOUT_MS = 10_000;

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

/** Calls the BE with the User's access token. Every auth route uses the same timeout and headers. */
export function fetchBackendWithBearer(endpoint: string, accessToken: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<Response> {
  return fetch(getBackendAuthUrl(endpoint), {
    method: init.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

/** The JSON body of a successful BE response, or null when the response was not OK. */
export async function readBackendJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }
  return (await parseBackendResponse<T>(response)) as T;
}
