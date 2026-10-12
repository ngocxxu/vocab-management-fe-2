import { describe, expect, it } from 'vitest';
import { adminUserIdSchema, updateAdminUserSchema } from './admin';

describe('updateAdminUserSchema', () => {
  it('accepts a role change', () => {
    expect(updateAdminUserSchema.safeParse({ role: 'MEMBER' }).success).toBe(true);
  });

  it('accepts deactivating, including an explicit false', () => {
    expect(updateAdminUserSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('rejects an empty change', () => {
    expect(updateAdminUserSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a role outside the admin role list', () => {
    expect(updateAdminUserSchema.safeParse({ role: 'ROOT' }).success).toBe(false);
  });
});

describe('adminUserIdSchema', () => {
  it('rejects an empty id', () => {
    expect(adminUserIdSchema.safeParse('   ').success).toBe(false);
  });
});
