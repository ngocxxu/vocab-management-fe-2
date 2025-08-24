export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

export type TResetPasswordData = {
  email: string;
};

export type TAuthResponse = {
  user: TUser;
  message: string;
  token?: string;
};

export type TVerifyResponse = {
  user: TUser;
  isAuthenticated: boolean;
};
