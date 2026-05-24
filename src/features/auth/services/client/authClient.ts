import type {
  TAuthResponse,
  TOAuthData,
  TOAuthResponse,
  TResendConfirmationData,
  TSigninData,
  TSignupData,
  TVerifyOtpData,
} from '@/types/auth';
import { authApi } from '@/utils/client-api';

export const authClient = {
  signin: (data: TSigninData): Promise<TAuthResponse> => authApi.signin(data),
  signup: (data: TSignupData): Promise<TAuthResponse> => authApi.signup(data),
  oauth: (data: TOAuthData): Promise<TOAuthResponse> => authApi.oauth(data),
  verifyOtp: (data: TVerifyOtpData): Promise<TAuthResponse> => authApi.verifyOtp(data),
  resendConfirmation: (data: TResendConfirmationData): Promise<{ message: string }> => authApi.resendConfirmation(data),
};
