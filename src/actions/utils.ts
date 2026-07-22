import { isStandardErrorBody } from '@/types/api-error';
import { BackendRequestError } from '@/utils/backend-request-error';

export function toActionError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof BackendRequestError && isStandardErrorBody(error.body)) {
    const message = Array.isArray(error.body.message) ? error.body.message.join(', ') : error.body.message;
    return new Error(message);
  }
  return error instanceof Error ? error : new Error(fallbackMessage);
}
