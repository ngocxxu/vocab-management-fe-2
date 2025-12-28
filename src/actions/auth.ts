'use server';

import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData, TUser } from '@/types/auth';
import { cookies } from 'next/headers';
import { logger } from '@/libs/Logger';
import { authApi } from '@/utils/server-api';

export async function signin(signinData: TSigninData): Promise<TAuthResponse> {
  try {
    const result = await authApi.signin(signinData);

    if (result.token) {
      const cookieStore = await cookies();
      cookieStore.set('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
  }
}

export async function signup(signupData: TSignupData): Promise<TAuthResponse> {
  try {
    const result = await authApi.signup(signupData);

    if (result.token) {
      const cookieStore = await cookies();
      cookieStore.set('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign up');
  }
}

export async function signout(): Promise<{ message: string }> {
  try {
    const result = await authApi.signout();
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign out');
  }
}

export async function refresh(refreshData: TRefreshData): Promise<{ message: string }> {
  try {
    const result = await authApi.refresh(refreshData);
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to refresh token');
  }
}

export async function resetPassword(resetData: TResetPasswordData): Promise<{ message: string }> {
  try {
    const result = await authApi.resetPassword(resetData);
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reset password');
  }
}

export async function verifyUser(): Promise<TUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

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
