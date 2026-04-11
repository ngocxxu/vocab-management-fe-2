'use server';

import { cache } from 'react';
import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData, TUser } from '@/types/auth';
import { logger } from '@/libs/Logger';
import { clearAuthCookies, getAccessToken, setAuthCookies } from '@/utils/auth-cookies';
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
  try {
    const result = await authApi.signout();
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to sign out');
  } finally {
    await clearAuthCookies();
  }
}

export async function refresh(refreshData: TRefreshData): Promise<{ message: string }> {
  try {
    const result = await authApi.refresh(refreshData);
    return result;
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

async function verifyUserImpl(): Promise<TUser | null> {
  try {
    const token = await getAccessToken();

    if (!token) {
      return null;
    }

    const result = await authApi.verify();
    return result;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      const errorStatus = (error as { status: number }).status;
      if (errorStatus === 403 || errorStatus === 401) {
        return null;
      }
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
