import type { TSigninData, TSignupData } from '@/types/auth';
import { Env } from '@/libs/Env';
import { supabase } from '@/libs/supabase';
import { useCallback, useState } from 'react';
import { authClient } from '../services/client/authClient';
import { getAuthErrorMessage } from '../utils/getAuthErrorMessage';

type OAuthProvider = 'google' | 'apple' | 'facebook' | 'twitter';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const signin = useCallback(async (data: TSigninData) => {
    setErrorMessage('');
    try {
      await authClient.signin(data);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, 'Failed to sign in. Please try again.'));
      throw err;
    }
  }, []);

  const signup = useCallback(async (data: TSignupData) => {
    setErrorMessage('');
    try {
      await authClient.signup(data);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, 'Failed to sign up. Please try again.'));
      throw err;
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: OAuthProvider, redirectTo: string) => {
    setIsOAuthLoading(true);
    setErrorMessage('');

    try {
      const origin = getOrigin();
      if (!origin) {
        throw new Error('Origin URL could not be determined');
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sign in with provider. Please try again.');
      setIsOAuthLoading(false);
      throw err;
    }
  }, []);

  return {
    errorMessage,
    setErrorMessage,
    isOAuthLoading,
    signin,
    signup,
    signInWithProvider,
  };
}
