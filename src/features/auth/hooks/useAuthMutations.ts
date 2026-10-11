import type { TOAuthProvider, TResendConfirmationData, TSigninData, TSignupData } from '@/types/auth';
import { useTranslations } from 'next-intl';
import { Env } from '@/libs/Env';
import { supabase } from '@/libs/supabase';
import { useCallback, useState } from 'react';
import { authClient } from '../services/client/authClient';
import { getAuthErrorMessage } from '../utils/getAuthErrorMessage';

function getOrigin(): string | undefined {
  if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
    const origin = (globalThis as { location?: { origin?: string } }).location?.origin;
    if (origin) {
      return origin;
    }
  }
  return Env.NEXT_PUBLIC_APP_URL;
}

export function useAuthMutations() {
  const t = useTranslations('auth');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const signin = useCallback(async (data: TSigninData) => {
    setErrorMessage('');
    try {
      await authClient.signin(data);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, t('errors.signIn')));
      throw err;
    }
  }, [t]);

  const signup = useCallback(async (data: TSignupData) => {
    setErrorMessage('');
    try {
      return await authClient.signup(data);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, t('errors.signUp')));
      throw err;
    }
  }, [t]);

  const resendConfirmation = useCallback(async (data: TResendConfirmationData) => {
    setErrorMessage('');
    try {
      return await authClient.resendConfirmation(data);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, t('errors.resendConfirmation')));
      throw err;
    }
  }, [t]);

  const signInWithProvider = useCallback(async (provider: TOAuthProvider, redirectTo: string) => {
    setIsOAuthLoading(true);
    setErrorMessage('');

    try {
      const origin = getOrigin();
      if (!origin) {
        throw new Error(t('errors.originUnavailable'));
      }

      const callbackUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      });
      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('errors.provider'));
      setIsOAuthLoading(false);
      throw err;
    }
  }, [t]);

  return {
    errorMessage,
    setErrorMessage,
    isOAuthLoading,
    signin,
    signup,
    resendConfirmation,
    signInWithProvider,
  };
}
