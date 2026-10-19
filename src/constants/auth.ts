export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
};
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

/** Starts Auth0 Universal Login. A plain <a>/location target on purpose: it sets a cookie and redirects off-site, so it must not be client-routed or prefetched. */
export const LOGIN_PATH = '/api/auth/login';
export const SIGNUP_PATH = '/api/auth/login?mode=signup';

/** Starts connecting another sign-in method to the signed-in User (?method=google|password). */
export const LINK_START_PATH = '/api/auth/link';
