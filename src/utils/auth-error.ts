import { BackendRequestError } from '@/utils/backend-request-error';

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof BackendRequestError) {
    return error.statusCode === 401 || error.statusCode === 403;
  }

  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: unknown }).statusCode;
    return statusCode === 401 || statusCode === 403;
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: unknown }).status;
    return status === 401 || status === 403;
  }

  return error instanceof Error && error.message === 'Unauthorized';
}

export function hasUnauthorizedError(errors: unknown[]): boolean {
  return errors.some(isUnauthorizedError);
}

export function getExpiredSessionRedirect(path: string): string {
  const params = new URLSearchParams({
    redirect: path,
    expired: '1',
  });

  return `/signin?${params.toString()}`;
}
