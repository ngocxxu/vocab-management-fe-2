export function isQuotaError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as { statusCode: number }).statusCode === 403;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 403;
  }
  return false;
}

export const QUOTA_ERROR_MESSAGE = 'Limit reached. Upgrade to Member for more.';
