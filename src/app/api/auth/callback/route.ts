import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { UNVERIFIED_TOKEN_COOKIE, VERIFY_EMAIL_PATH } from '@/constants/auth';
import { AUTH0_CALLBACK_PATH, AUTH0_TXN_COOKIE, exchangeCode, getAppOrigin, getAuth0Config, parseTransaction, statesMatch } from '@/libs/auth0';
import { logger } from '@/libs/Logger';
import { API_METHODS } from '@/utils/api-config';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS, UNVERIFIED_TOKEN_COOKIE_OPTIONS } from '@/utils/auth-cookies';
import { appRedirect } from '../link-result';
import { fetchBackendWithBearer, parseBackendResponse } from '../session-response';
import { finishLink, linkFailed } from './link';

// Codes the landing page knows how to explain; anything else from the BE is shown as a generic failure.
const KNOWN_SYNC_ERRORS = new Set(['email_not_verified', 'account_link_required']);

// An unverified email has its own page with the way forward, so it does not land on the landing page. The page asks the BE to
// resend the link for this login, so it gets the login's token in a short-lived cookie instead of asking the User for an address.
function failure(appOrigin: string, code: string, accessToken?: string): NextResponse {
  if (code === 'email_not_verified') {
    const response = appRedirect(appOrigin, VERIFY_EMAIL_PATH, {}, { clearTransaction: true });
    if (accessToken) {
      response.cookies.set(UNVERIFIED_TOKEN_COOKIE, accessToken, UNVERIFIED_TOKEN_COOKIE_OPTIONS);
    }
    return response;
  }
  return appRedirect(appOrigin, '/', { auth_error: code }, { clearTransaction: true });
}

/** Creates the Vocab user on first login (idempotent). Returns an error code, or null on success. */
async function syncUser(accessToken: string): Promise<string | null> {
  const response = await fetchBackendWithBearer(API_METHODS.auth.sync().endpoint, accessToken, { method: 'POST' });
  if (response.ok) {
    return null;
  }
  const body = await parseBackendResponse<unknown>(response) as { message?: unknown };
  const message = typeof body.message === 'string' ? body.message : '';
  logger.warn('Auth sync rejected:', { status: response.status, message });
  return KNOWN_SYNC_ERRORS.has(message) ? message : 'login_failed';
}

// GET /api/auth/callback - finish the login: verify state, swap the code for tokens, provision the user, set cookies
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const appOrigin = getAppOrigin(origin);
  const transaction = parseTransaction(request.cookies.get(AUTH0_TXN_COOKIE)?.value);

  if (transaction?.purpose === 'link') {
    // A link never signs anyone in. A refused or cancelled Auth0 step comes back here too, so it is handled as a failed link.
    const linkCode = searchParams.get('code');
    if (searchParams.get('error') || !linkCode || !statesMatch(transaction.state, searchParams.get('state'))) {
      return linkFailed(appOrigin, transaction);
    }
    return finishLink(appOrigin, transaction, linkCode, request.cookies.get('accessToken')?.value);
  }

  if (searchParams.get('error')) {
    logger.warn('Auth0 returned an error:', { error: searchParams.get('error'), description: searchParams.get('error_description') });
    return failure(appOrigin, 'login_failed');
  }
  const code = searchParams.get('code');
  if (!transaction || !code || !statesMatch(transaction.state, searchParams.get('state'))) {
    return failure(appOrigin, 'login_failed');
  }

  try {
    const tokens = await exchangeCode(getAuth0Config(), {
      code,
      verifier: transaction.verifier,
      redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}`,
    });
    if (!tokens) {
      return failure(appOrigin, 'login_failed');
    }
    if (!tokens.refreshToken) {
      // Without a refresh token the session would die when the access token expires.
      logger.error('Auth0 returned no refresh token: enable "Allow Offline Access" on the API.');
      return failure(appOrigin, 'login_failed');
    }

    const syncError = await syncUser(tokens.accessToken);
    if (syncError) {
      return failure(appOrigin, syncError, tokens.accessToken);
    }

    const response = NextResponse.redirect(new URL(transaction.redirect, appOrigin));
    response.cookies.set('accessToken', tokens.accessToken, AUTH_COOKIE_OPTIONS);
    response.cookies.set('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    response.cookies.set(AUTH0_TXN_COOKIE, '', { path: '/api/auth', maxAge: 0 });
    response.cookies.set(UNVERIFIED_TOKEN_COOKIE, '', { ...UNVERIFIED_TOKEN_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  } catch (error) {
    logger.error('Auth0 callback failed:', { error });
    return failure(appOrigin, 'login_failed');
  }
}
