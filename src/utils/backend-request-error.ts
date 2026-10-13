export class BackendRequestError extends Error {
  readonly statusCode: number;
  readonly body: unknown;

  constructor(message: string, statusCode: number, body: unknown) {
    super(message);
    this.name = 'BackendRequestError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

const HTTP_NOT_FOUND = 404;

/** True when the BE answered 404. Callers use it where a missing record already means the goal is met. */
export function isBackendNotFound(error: unknown): boolean {
  return error instanceof BackendRequestError && error.statusCode === HTTP_NOT_FOUND;
}
