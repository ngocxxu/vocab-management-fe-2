export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
};
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

/** Starts Auth0 Universal Login. A plain <a>/location target on purpose: it sets a cookie and redirects off-site, so it must not be client-routed or prefetched. */
export const LOGIN_PATH = '/api/auth/login';
export const SIGNUP_PATH = '/api/auth/login?mode=signup';

/** Where the link flow lands the User: the Profile page, Security section. */
export const LINK_RETURN_PATH = '/profile';

/** Page to ask for a new verification email, reached from the landing error banner. Public: the User is not signed in yet. */
export const VERIFY_EMAIL_PATH = '/verify-email';

/** Matches the BE's per-address cooldown; the UI counts it down so the button is not offered too early. */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Starts connecting Google to the signed-in User. A form POST, so a cross-site page cannot trigger it (the cookie is SameSite=Lax). */
export const LINK_START_PATH = '/api/auth/link';

/** Methods the link flow can connect. A password is added by the BE instead (POST /auth/identities/password). */
export const LINKABLE_METHOD_IDS = ['google'] as const;
export type TLinkableMethodId = (typeof LINKABLE_METHOD_IDS)[number];

/** Codes the Settings page can explain: link results, plus the password refusals. Anything else shows a generic failure. */
export const ACCOUNT_ERROR_CODES = [
  'identity_already_linked',
  'email_not_verified',
  'link_proof_stale',
  'link_nonce_invalid',
  'id_token_invalid',
  'link_session_changed',
  'link_failed',
  'password_login_exists',
] as const;
export type TAccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[number];

export function isAccountErrorCode(value: string): value is TAccountErrorCode {
  return (ACCOUNT_ERROR_CODES as readonly string[]).includes(value);
}
