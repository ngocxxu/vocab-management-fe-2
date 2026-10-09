import type { TVocabInUse } from '@/types/vocab-conflict';
import { BackendRequestError } from '@/utils/backend-request-error';

const HTTP_CONFLICT = 409;

// The backend error envelope keeps only the message: its error code and details are not sent to the client,
// so a 409 is recognised by its message (see VocabInUseException and the vocab delete path in the backend).
const SINGLE_IN_USE = /Cannot delete vocab\. (\d+) trainers? (?:is|are) using it/i;
const BULK_IN_USE = /Cannot delete (\d+) vocabs\./i;

/** The conflict behind a refused delete, or null for any other error. */
export function parseVocabInUse(error: unknown): TVocabInUse | null {
  if (!(error instanceof BackendRequestError) || error.statusCode !== HTTP_CONFLICT) {
    return null;
  }

  const message = messageText(error.body);
  if (message === null) {
    return null;
  }

  const bulk = message.match(BULK_IN_USE);
  if (bulk?.[1] !== undefined) {
    return { kind: 'bulk', blockedCount: Number.parseInt(bulk[1], 10) };
  }

  const single = message.match(SINGLE_IN_USE);
  if (single?.[1] !== undefined) {
    return { kind: 'single', trainerCount: Number.parseInt(single[1], 10) };
  }

  return null;
}

/** Sentence for a toast when a delete was refused. */
export function vocabInUseText(conflict: TVocabInUse): string {
  if (conflict.kind === 'single') {
    const { trainerCount } = conflict;
    return `This vocab is used by ${trainerCount} ${trainerCount === 1 ? 'trainer' : 'trainers'}. Remove it from the trainers first.`;
  }

  const { blockedCount } = conflict;
  return `${blockedCount} ${blockedCount === 1 ? 'vocab is' : 'vocabs are'} used by trainers. Remove ${blockedCount === 1 ? 'it' : 'them'} from the trainers first. Nothing was deleted.`;
}

function messageText(body: unknown): string | null {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return null;
  }

  const { message } = body as { message: unknown };
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  return null;
}
