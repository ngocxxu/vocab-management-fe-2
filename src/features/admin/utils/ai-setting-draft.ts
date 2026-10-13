// Radix Select cannot hold an empty value, so "env default" is a sentinel that maps back to an empty draft.
const ENV_DEFAULT_OPTION = 'env-default';

/** The Select value for a draft. An empty draft shows as the env-default option. */
export function toSelectValue(draft: string): string {
  return draft === '' ? ENV_DEFAULT_OPTION : draft;
}

/** The draft for a Select value. The env-default option maps back to an empty draft. */
export function fromSelectValue(value: string): string {
  return value === ENV_DEFAULT_OPTION ? '' : value;
}

/** The stored value for a draft. A blank draft means the env default, so it is stored as null. */
export function toSettingValue(draft: string): string | null {
  const trimmed = draft.trim();
  return trimmed === '' ? null : trimmed;
}

/** Whether saving this draft would change the stored value, so Save should be enabled. */
export function isSettingChanged(draft: string, stored: string | null): boolean {
  return toSettingValue(draft) !== stored;
}
