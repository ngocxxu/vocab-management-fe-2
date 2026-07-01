export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  supabaseUserId: string;
  avatar?: string;
  phone?: string;
};

export type TSigninData = {
  email: string;
  password: string;
};

export type TSignupData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  role: string;
};

export type TRefreshData = {
  refreshToken: string;
};

export type TOAuthProvider = 'google' | 'github' | 'facebook' | 'apple';

export type TOAuthData = {
  provider: TOAuthProvider;
  redirectTo?: string;
};

export type TOAuthResponse = {
  url: string;
  provider: TOAuthProvider;
};

export type TResetPasswordData = {
  email: string;
};

export type TAuthResponse = {
  user: TUser;
  message?: string;
};

export type TSignUpResponse = {
  session: TSessionDto | null;
  message: string | null;
};

export type TSignUpResult = {
  user: TUser | null;
  message?: string | null;
};

export type TVerifyResponse = {
  user: TUser;
  isAuthenticated: boolean;
};

export type TOAuthSyncInput = {
  accessToken: string;
  refreshToken: string;
};

export type TOAuthSyncResponse = TAuthResponse;

export type TVerifyOtpData = {
  email: string;
  token: string;
  type: 'signup' | 'recovery' | 'email_change';
};

export type TResendConfirmationData = {
  email: string;
};

export type TSessionDto = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: string;
  token_type: string;
  user: TUser;
};
