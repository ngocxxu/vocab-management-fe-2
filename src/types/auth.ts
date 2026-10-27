export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  mcpAccess?: boolean;
  avatar?: string;
  phone?: string;
};

export type TRefreshData = {
  refreshToken: string;
};

export type TSessionDto = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: string;
  token_type: string;
  user: TUser;
};

/** What a refresh returns: only tokens, the user is not part of Auth0's token response. */
export type TRefreshedSession = Pick<TSessionDto, 'access_token' | 'refresh_token'>;

/** Sign-in methods from the BE: `methods` are connected; `pending` have a login whose password is not set yet (email still open). */
export type TSignInMethods = {
  methods: string[];
  pending: string[];
};
