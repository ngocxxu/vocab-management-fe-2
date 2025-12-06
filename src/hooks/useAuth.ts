import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData } from '@/types/auth';
import { useEffect, useState } from 'react';
import { authApi } from '@/utils/client-api';

export const useAuth = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authApi.verify();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.verify();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: data,
    isAuthenticated: data?.isAuthenticated || false,
    isLoading,
    isError: error,
    mutate,
  };
};

export const authMutations = {
  signin: async (signinData: TSigninData): Promise<TAuthResponse> => {
    return await authApi.signin(signinData);
  },
  signup: async (signupData: TSignupData): Promise<TAuthResponse> => {
    return await authApi.signup(signupData);
  },
  signout: async (): Promise<{ message: string }> => {
    return await authApi.signout();
  },
  refresh: async (refreshData: TRefreshData): Promise<{ message: string }> => {
    return await authApi.refresh(refreshData);
  },
  resetPassword: async (resetData: TResetPasswordData): Promise<{ message: string }> => {
    return await authApi.resetPassword(resetData);
  },
};
