import type { TAdminUser, TUpdateAdminUserInput } from '@/types/admin';

export type TAdminUserToggleFlag = 'isActive' | 'mcpAccess';

// Each flag maps to the toast key for turning it on and for turning it off. The toast names the state the flag moves to.
const TOGGLE_TOAST_KEYS = {
  isActive: { on: 'activated', off: 'deactivated' },
  mcpAccess: { on: 'mcpEnabled', off: 'mcpDisabled' },
} as const;

/** Flips one on/off flag on a user. Returns the change to send and the toast key for the new state. */
export function buildAdminUserToggle(user: TAdminUser, flag: TAdminUserToggleFlag) {
  const toastKeys = TOGGLE_TOAST_KEYS[flag];
  const change: TUpdateAdminUserInput = { [flag]: !user[flag] };
  return { change, toastKey: user[flag] ? toastKeys.off : toastKeys.on };
}
