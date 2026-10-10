import { getTranslations } from 'next-intl/server';
import { isStandardErrorBody } from '@/types/api-error';
import { BackendRequestError } from '@/utils/backend-request-error';

const TOO_MANY_REQUESTS = 429;
const SERVER_ERROR_MIN = 500;

/**
 * Backend messages are English only. Client errors (4xx) keep the backend text because it names the
 * specific problem, such as wrong credentials. Server errors and rate limits get a generic translated text.
 * Anything else falls back to the translated text for `fallbackKey` in the `errors` namespace.
 */
export async function toActionError(error: unknown, fallbackKey: string): Promise<Error> {
  if (error instanceof BackendRequestError && isStandardErrorBody(error.body)) {
    const { statusCode } = error.body;
    if (statusCode >= SERVER_ERROR_MIN) {
      return new Error(await translate('status.server'));
    }
    if (statusCode === TOO_MANY_REQUESTS) {
      return new Error(await translate('status.tooManyRequests'));
    }
    const message = Array.isArray(error.body.message) ? error.body.message.join(', ') : error.body.message;
    return new Error(message);
  }

  return error instanceof Error ? error : new Error(await translate(fallbackKey));
}

// Looked up only when a translated text is needed, so the 4xx path does not depend on the request scope.
async function translate(key: string): Promise<string> {
  const t = await getTranslations('errors');
  return t(key);
}

/** Translated text from the `errors` namespace, for error strings an action builds itself. */
export const translateError = translate;
