'use client';

import type { TSignInMethods } from '@/types/auth';
import { useEffect } from 'react';
import { getSignInMethods } from '@/actions/auth';

// Coming back to the tab after the set-password email is the moment the state may have changed. Focus events come in bursts, so this caps the rate.
const REFRESH_MIN_INTERVAL_MS = 10_000;

/** While a password is pending, re-reads the sign-in methods when the tab regains focus, at most every REFRESH_MIN_INTERVAL_MS. */
export function useSignInMethodsRefresh(isPasswordPending: boolean, onRefresh: (latest: TSignInMethods) => void): void {
  useEffect(() => {
    if (!isPasswordPending) {
      return undefined;
    }
    let lastCheckedAt = 0;
    const refreshIfVisible = async () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheckedAt < REFRESH_MIN_INTERVAL_MS) {
        return;
      }
      lastCheckedAt = Date.now();
      const latest = await getSignInMethods().catch(() => null);
      if (latest) {
        onRefresh(latest);
      }
    };
    globalThis.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      globalThis.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [isPasswordPending, onRefresh]);
}
