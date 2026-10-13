import { describe, expect, it } from 'vitest';
import { toBroadcastPayload } from './broadcast-payload';

const values = {
  message: 'Maintenance tonight',
  priority: 'HIGH' as const,
  expiresAt: '2099-01-01T10:00',
  target: 'ALL' as const,
  role: undefined,
  userIds: [],
};

describe('toBroadcastPayload', () => {
  it('sends the message, priority, target and expiry as an ISO instant', () => {
    expect(toBroadcastPayload(values)).toEqual({
      message: 'Maintenance tonight',
      priority: 'HIGH',
      expiresAt: new Date(2099, 0, 1, 10, 0).toISOString(),
      target: 'ALL',
    });
  });

  it('leaves out the role and the user IDs for an all-users broadcast', () => {
    const payload = toBroadcastPayload({ ...values, role: 'MEMBER', userIds: ['user-1'] });

    expect(payload).not.toHaveProperty('role');
    expect(payload).not.toHaveProperty('userIds');
  });

  it('sends the role and leaves out the user IDs for a role broadcast', () => {
    const payload = toBroadcastPayload({ ...values, target: 'ROLE', role: 'MEMBER', userIds: ['user-1'] });

    expect(payload).toMatchObject({ target: 'ROLE', role: 'MEMBER' });
    expect(payload).not.toHaveProperty('userIds');
  });

  it('sends the user IDs and leaves out the role for a users broadcast', () => {
    const payload = toBroadcastPayload({ ...values, target: 'USERS', role: 'MEMBER', userIds: ['user-1', 'user-2'] });

    expect(payload).toMatchObject({ target: 'USERS', userIds: ['user-1', 'user-2'] });
    expect(payload).not.toHaveProperty('role');
  });
});
