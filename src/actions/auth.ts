'use server';

import { cache } from 'react';
import type {
  TAuthResponse,
  TChangePasswordData,
  TRefreshData,
  TResendConfirmationData,
  TResetPasswordData,
  TSigninData,
  TSignupData,
  TSignUpResult,
  TUser,
  TVerifyOtpData,
} from '@/types/auth';
import { logger } from '@/libs/Logger';
import { getRefreshLock, getRefreshLockKey, invalidateRefreshLock, performRefresh } from '@/libs/refresh-lock';
import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from '@/utils/auth-cookies';
import { isUnauthorizedError } from '@/utils/auth-error';
import { authApi } from '@/utils/server-api';
import { toActionError } from './utils';

export async function signin(signinData: TSigninData): Promise<TAuthResponse> {
  try {
    const result = await authApi.signin(signinData);

    // Set HttpOnly cookies with tokens from NestJS response
    if (result.access_token && result.refresh_token) {
      await setAuthCookies(result.access_token, result.refresh_token);
    }

    // Return user info (without tokens)
    return {
      user: result.user,
      message: 'Signed in successfully',
    };
  } catch (error) {
    throw toActionError(error, 'Failed to sign in');
  }
}

export async function signup(signupData: TSignupData): Promise<TSignUpResult> {
  try {
    const result = await authApi.signup(signupData);

    if (!result.session) {
      return { user: null, message: result.message };
    }

    // Set HttpOnly cookies with tokens from NestJS response
    await setAuthCookies(result.session.access_token, result.session.refresh_token);

    // Return user info (without tokens)
    return {
      user: result.session.user,
      message: 'Signed up successfully',
    };
  } catch (error) {
    throw toActionError(error, 'Failed to sign up');
  }
}

export async function signout(): Promise<{ message: string }> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  try {
    const result = await authApi.signout();
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to sign out');
  } finally {
    invalidateRefreshLock(accessToken, refreshToken);
    await clearAuthCookies();
  }
}

export async function refresh(refreshData: TRefreshData): Promise<{ message: string }> {
  try {
    const lockKey = getRefreshLockKey(undefined, refreshData.refreshToken);
    const result = await getRefreshLock(lockKey).getOrRefresh(
      () => performRefresh(refreshData.refreshToken),
    );

    if (!result) {
      throw new Error('Failed to refresh token');
    }

    await setAuthCookies(result.access_token, result.refresh_token);

    return { message: 'Token refreshed successfully' };
  } catch (error) {
    throw toActionError(error, 'Failed to refresh token');
  }
}

export async function resetPassword(resetData: TResetPasswordData): Promise<{ message: string }> {
  try {
    const result = await authApi.resetPassword(resetData);
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to reset password');
  }
}

export async function verifyOtp(verifyOtpData: TVerifyOtpData): Promise<TAuthResponse> {
  try {
    const result = await authApi.verifyOtp(verifyOtpData);

    if (result.access_token && result.refresh_token) {
      await setAuthCookies(result.access_token, result.refresh_token);
    }

    return {
      user: result.user,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    throw toActionError(error, 'Failed to verify OTP');
  }
}

export async function resendConfirmation(data: TResendConfirmationData): Promise<{ message: string }> {
  try {
    const result = await authApi.resendConfirmation(data);
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to resend confirmation');
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
    throw toActionError(error, 'Failed to delete account');
  } finally {
    invalidateRefreshLock(accessToken, refreshToken);
    await clearAuthCookies();
  }
}

export async function changePassword(data: TChangePasswordData): Promise<{ message: string }> {
  await requireAuth();

  try {
    const result = await authApi.changePassword(data);
    // Supabase revokes every existing session (including this one) when a password changes.
    // The backend signs back in with the new password — adopt that fresh session so the user stays logged in.
    await setAuthCookies(result.session.access_token, result.session.refresh_token);
    return { message: result.message };
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw toActionError(error, 'Failed to update password');
    }

    // Access token expired between page load and submit — refresh and retry once (mirrors verifyUserImpl).
    const token = await getAccessToken();
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw toActionError(error, 'Failed to update password');
    }

    const lockKey = getRefreshLockKey(token, refreshToken);
    const session = await getRefreshLock(lockKey).getOrRefresh(
      () => performRefresh(refreshToken),
    );
    if (!session) {
      throw toActionError(error, 'Failed to update password');
    }

    await setAuthCookies(session.access_token, session.refresh_token);

    try {
      const result = await authApi.changePassword(data);
      await setAuthCookies(result.session.access_token, result.session.refresh_token);
      return { message: result.message };
    } catch (retryError) {
      throw toActionError(retryError, 'Failed to update password');
    }
  }
}

export async function requireAuth(): Promise<TUser> {
  const user = await verifyUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
