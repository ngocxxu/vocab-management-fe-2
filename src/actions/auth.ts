'use server';

import { cache } from 'react';
import type {
  TRefreshData,
  TUser,
} from '@/types/auth';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, invalidateRefreshLock, performRefresh } from '@/libs/refresh-lock';
import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from '@/utils/auth-cookies';
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
