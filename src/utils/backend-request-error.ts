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
