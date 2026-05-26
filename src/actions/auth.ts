'use server';

import { cache } from 'react';
import type {
  TAuthResponse,
  TRefreshData,
  TResendConfirmationData,
  TResetPasswordData,
  TSigninData,
  TSignupData,
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

export async function signup(signupData: TSignupData): Promise<TAuthResponse> {
  try {
    const result = await authApi.signup(signupData);

    // Set HttpOnly cookies with tokens from NestJS response
    if (result.access_token && result.refresh_token) {
      await setAuthCookies(result.access_token, result.refresh_token);
    }

    // Return user info (without tokens)
    return {
      user: result.user,
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

    const result = await authApi.verify();
    return result;
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    if (isUnauthorizedError(error)) {
      return null;
    }
    logger.error('Failed to verify user:', { error });
    return null;
  }
}

export const verifyUser = cache(verifyUserImpl);

export async function requireAuth(): Promise<TUser> {
  const user = await verifyUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
