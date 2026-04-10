import type { TAuthResponse, TSigninData, TSignupData } from '@/types/auth';
import { authApi } from '@/utils/client-api';

export const authClient = {
  signin: (data: TSigninData): Promise<TAuthResponse> => authApi.signin(data),
  signup: (data: TSignupData): Promise<TAuthResponse> => authApi.signup(data),
};
