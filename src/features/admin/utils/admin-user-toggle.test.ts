import type { TAdminUser } from '@/types/admin';
import { describe, expect, it } from 'vitest';
import { buildAdminUserToggle } from './admin-user-toggle';

const user: TAdminUser = {
  id: 'user-1',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Tran',
  role: 'MEMBER',
  isActive: true,
  mcpAccess: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildAdminUserToggle', () => {
  describe('mcpAccess', () => {
    it('turns MCP access on for a user who has none', () => {
      const toggle = buildAdminUserToggle({ ...user, mcpAccess: false }, 'mcpAccess');

      expect(toggle).toEqual({ change: { mcpAccess: true }, toastKey: 'mcpEnabled' });
    });

    it('turns MCP access off for a user who has it', () => {
      const toggle = buildAdminUserToggle({ ...user, mcpAccess: true }, 'mcpAccess');

      expect(toggle).toEqual({ change: { mcpAccess: false }, toastKey: 'mcpDisabled' });
    });
  });

  describe('isActive', () => {
    it('reactivates an inactive user', () => {
      const toggle = buildAdminUserToggle({ ...user, isActive: false }, 'isActive');

      expect(toggle).toEqual({ change: { isActive: true }, toastKey: 'activated' });
    });

    it('deactivates an active user', () => {
      const toggle = buildAdminUserToggle({ ...user, isActive: true }, 'isActive');

      expect(toggle).toEqual({ change: { isActive: false }, toastKey: 'deactivated' });
    });
  });
});
