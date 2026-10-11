// Zod schemas return message keys under this prefix. Anything without it (a server text, a plain sentence) is shown as is.
export const VALIDATION_KEY_PREFIX = 'validation.';

export function isValidationKey(message: string): boolean {
  return message.startsWith(VALIDATION_KEY_PREFIX);
}

/** Returns the translated text for a validation key, or the message unchanged when it is not a key. */
export function toDisplayMessage(message: string, translate: (key: string) => string): string {
  return isValidationKey(message) ? translate(message) : message;
}
