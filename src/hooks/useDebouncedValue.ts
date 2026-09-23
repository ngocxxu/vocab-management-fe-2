import { useEffect, useState } from 'react';

/**
 * Mirrors `value`, but only after it has stopped changing for `delayMs`.
 *
 * Exists because search inputs here drive real network work — a URL change that
 * refetches the page, or an embedding call — and firing that per keystroke wastes
 * a request (and Gemini quota) on every intermediate string the user types through.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    // Each new value cancels the previous timer, so only the final value in a
    // burst of typing ever lands.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
