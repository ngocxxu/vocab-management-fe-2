import type { TBroadcastFormValues } from '@/libs/validations/broadcast';
import type { TBroadcastPayload } from '@/types/admin';

/** Turns the compose form into the BE body. A field the chosen target does not use is left out. */
export function toBroadcastPayload(values: TBroadcastFormValues): TBroadcastPayload {
  const payload = {
    message: values.message,
    priority: values.priority,
    expiresAt: new Date(values.expiresAt).toISOString(),
    target: values.target,
  };

  if (values.target === 'ROLE') {
    return { ...payload, role: values.role };
  }

  if (values.target === 'USERS') {
    return { ...payload, userIds: values.userIds };
  }

  return payload;
}
