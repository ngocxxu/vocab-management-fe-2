import { z } from 'zod';

export const BROADCAST_MESSAGE_MAX_LENGTH = 500;

// The same limits as the BE BroadcastNotificationInput. The form's expiry is a datetime-local value, which has no time zone.
export const broadcastFormSchema = z
  .object({
    message: z.string().trim().min(1).max(BROADCAST_MESSAGE_MAX_LENGTH),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    expiresAt: z.string().min(1),
    target: z.enum(['ALL', 'ROLE', 'USERS']),
    role: z.enum(['ADMIN', 'MEMBER', 'GUEST']).optional(),
    userIds: z.array(z.string()),
  })
  .superRefine((value, context) => {
    if (value.target === 'ROLE' && value.role === undefined) {
      context.addIssue({ code: 'custom', path: ['role'], message: 'required' });
    }

    if (value.target === 'USERS' && value.userIds.length === 0) {
      context.addIssue({ code: 'custom', path: ['userIds'], message: 'required' });
    }

    const expiresAt = new Date(value.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      context.addIssue({ code: 'custom', path: ['expiresAt'], message: 'future' });
    }
  });

export type TBroadcastFormValues = z.infer<typeof broadcastFormSchema>;
