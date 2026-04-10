export function getAuthErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'response' in err) {
    const maybeResponse = (err as { response?: { data?: { error?: string } } }).response;
    const apiMsg = maybeResponse?.data?.error;
    if (apiMsg) {
      return apiMsg;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
