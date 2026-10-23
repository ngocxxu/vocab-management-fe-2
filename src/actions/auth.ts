'use server';

import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import type {
  TRefreshData,
  TSignInMethods,
  TUser,
} from '@/types/auth';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, invalidateRefreshLock, performRefresh } from '@/libs/refresh-lock';
import { clearAuthCookies, getAccessToken, getRefreshToken, getUnverifiedAccessToken, setAuthCookies } from '@/utils/auth-cookies';
import { isUnauthorizedError } from '@/utils/auth-error';
import { isAdmin } from '@/utils/is-admin';
import { authApi } from '@/utils/server-api';
import { toActionError, translateError } from './utils';

export async function signout(): Promise<{ message: string }> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  // Tokens are Auth0's now, so there is no backend session to end: clearing the cookies is the sign-out.
  invalidateRefreshLock(accessToken, refreshToken);
  await clearAuthCookies();
  return { message: 'Successfully signed out' };
}

export async function refresh(refreshData: TRefreshData): Promise<{ message: string }> {
  try {
    const lockKey = getRefreshLockKey(undefined, refreshData.refreshToken);
    const result = await getRefreshLock(lockKey).getOrRefresh(
      () => performRefresh(refreshData.refreshToken),
    );

    if (!result) {
      throw new Error(await translateError('refreshToken'));
    }

    await setAuthCookies(result.access_token, result.refresh_token);

    return { message: 'Token refreshed successfully' };
  } catch (error) {
    throw await toActionError(error, 'refreshToken');
  }
}

async function verifyUserImpl(): Promise<TUser | null> {
  try {
    const token = await getAccessToken();

    if (!token) {
      return null;
    }

    try {
      return await authApi.verify();
    } catch (verifyError) {
      if (!isUnauthorizedError(verifyError)) {
        throw verifyError;
      }

      // Access token expired — refresh and retry (mirrors Axios 401 interceptor on client)
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const lockKey = getRefreshLockKey(token, refreshToken);
      const session = await getRefreshLock(lockKey).getOrRefresh(
        () => performRefresh(refreshToken),
      );

      if (!session) {
        return null;
      }

      await setAuthCookies(session.access_token, session.refresh_token);

      try {
        return await authApi.verify();
      } catch {
        return null;
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    logger.error('Failed to verify user:', { error });
    return null;
  }
}

export const verifyUser = cache(verifyUserImpl);

/**
 * Asks the BE to create the caller's password login; Auth0 emails the set-password link (ADR 0004).
 * A refusal throws with the BE's code as the message (`email_not_verified`, `password_login_exists`), like other actions.
 */
export async function addPasswordLogin(): Promise<void> {
  await requireAuth();
  try {
    await authApi.addPassword();
  } catch (error) {
    throw await toActionError(error, 'link_failed');
  }
  revalidatePath('/profile');
}

/** The caller's connected sign-in methods as labels (`google`, `password`), or null when they cannot be loaded. */
export async function getSignInMethods(): Promise<TSignInMethods | null> {
  await requireAuth();
  try {
    return await authApi.signInMethods();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw error;
    }
    // The rest of the profile still works without this section.
    logger.error('Failed to load sign-in methods:', { error });
    return null;
  }
}

/**
 * Asks the BE to resend the verification link for the login that was just refused with `email_not_verified`. The login comes
 * from the callback's short-lived cookie, never from the caller, and Auth0 emails the address stored on that login.
 * No requireAuth() or revalidatePath(): that login has no session yet, as in signout and refresh.
 */
export async function resendVerificationEmail(): Promise<void> {
  const accessToken = await getUnverifiedAccessToken();
  if (!accessToken) {
    throw new Error(await translateError('verifyEmailExpired'));
  }
  try {
    await authApi.resendVerification(accessToken);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw new Error(await translateError('verifyEmailExpired'));
    }
    throw await toActionError(error, 'resendConfirmation');
  }
}

export async function deleteAccount(): Promise<{ message: string }> {
  await requireAuth();

  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  try {
    await authApi.deleteAccount();
    return { message: 'Account deleted successfully' };
  } catch (error) {
    throw await toActionError(error, 'deleteAccount');
  } finally {
    invalidateRefreshLock(accessToken, refreshToken);
    await clearAuthCookies();
  }
}

export async function requireAuth(): Promise<TUser> {
  const user = await verifyUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<TUser> {
  const user = await requireAuth();
  if (!isAdmin(user)) {
    throw new Error('Forbidden');
  }
  return user;
}
