export type StandardErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
  requestId?: string;
};

export function isStandardErrorBody(value: unknown): value is StandardErrorBody {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  const messageOk = typeof v.message === 'string' || Array.isArray(v.message);
  return (
    typeof v.statusCode === 'number'
    && typeof v.error === 'string'
    && messageOk
    && typeof v.timestamp === 'string'
    && typeof v.path === 'string'
  );
}
