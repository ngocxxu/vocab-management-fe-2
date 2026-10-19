import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  AUTH0_CALLBACK_PATH,
  AUTH0_CONNECTIONS,
  AUTH0_TXN_COOKIE,
  buildAuthorizeUrl,
  createTransaction,
  getAppOrigin,
  getAuth0Config,
  LINK_MAX_AGE_SECONDS,
  LINK_RETURN_PATH,
  LINK_SCOPE,
  transactionCookieOptions,
} from '@/libs/auth0';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from '@/i18n/config';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { getBackendAuthUrl, parseBackendResponse } from '../session-response';

const METHODS = { google: AUTH0_CONNECTIONS.google, password: AUTH0_CONNECTIONS.password } as const;

function backToProfile(appOrigin: string, code: string): NextResponse {
  const url = new URL(LINK_RETURN_PATH, appOrigin);
  url.searchParams.set('link_error', code);
  url.hash = 'security';
  return NextResponse.redirect(url);
}

async function callBackend<T>(path: string, accessToken: string, method: 'GET' | 'POST'): Promise<{ ok: boolean; body: T | null }> {
  const response = await fetch(getBackendAuthUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  const body = response.ok ? await parseBackendResponse<T>(response) as T : null;
  return { ok: response.ok, body };
}

// GET /api/auth/link?method=google|password - connect another sign-in method to the signed-in User (ADR 0004).
// Asks the BE for a single-use nonce, then sends the browser to Auth0 for a forced fresh sign-in that carries it back in the ID token.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const appOrigin = getAppOrigin(origin);
  const method = searchParams.get('method');
  const accessToken = request.cookies.get('accessToken')?.value;

  if (method !== 'google' && method !== 'password') {
    return backToProfile(appOrigin, 'link_failed');
  }
  if (!accessToken) {
    return NextResponse.redirect(new URL('/', appOrigin));
  }

  try {
    const [me, nonce] = await Promise.all([
      callBackend<{ id?: string }>(API_ENDPOINTS.auth.verify, accessToken, 'GET'),
      callBackend<{ nonce?: string }>(API_ENDPOINTS.auth.linkNonce, accessToken, 'POST'),
    ]);
    if (!me.body?.id || !nonce.body?.nonce) {
      return backToProfile(appOrigin, 'link_session_changed');
    }

    const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const { transaction, challenge } = createTransaction(LINK_RETURN_PATH, { userId: me.body.id });
    const authorizeUrl = buildAuthorizeUrl(getAuth0Config(), {
      redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}`,
      state: transaction.state,
      challenge,
      connection: METHODS[method],
      // A password the User does not have yet is created on the way, so the sign-up screen comes first.
      signup: method === 'password',
      nonce: nonce.body.nonce,
      forceLogin: true,
      maxAgeSeconds: LINK_MAX_AGE_SECONDS,
      scope: LINK_SCOPE,
      locale: isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE,
    });

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(AUTH0_TXN_COOKIE, JSON.stringify(transaction), transactionCookieOptions());
    return response;
  } catch (error) {
    logger.error('Auth0 link start failed:', { error });
    return backToProfile(appOrigin, 'link_failed');
  }
}
