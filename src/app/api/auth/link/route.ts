import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { TLinkableMethodId } from '@/constants/auth';
import { LINKABLE_METHOD_IDS } from '@/constants/auth';
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
import { API_METHODS } from '@/utils/api-config';
import { appRedirect } from '../link-result';
import { fetchBackendWithBearer, readBackendJson } from '../session-response';

// Fixed for every link: a forced fresh sign-in that must carry the nonce back in the ID token.
const LINK_LOGIN = { forceLogin: true, maxAgeSeconds: LINK_MAX_AGE_SECONDS, scope: LINK_SCOPE } as const;

function isLinkableMethod(value: FormDataEntryValue | null): value is TLinkableMethodId {
  return typeof value === 'string' && (LINKABLE_METHOD_IDS as readonly string[]).includes(value);
}

// POST /api/auth/link (form field `method`) - connect another sign-in method to the signed-in User (ADR 0004).
// Asks the BE for a single-use nonce, then sends the browser to Auth0 for a forced fresh sign-in that carries it back in the ID token.
// A form POST, not a GET: a cross-site page cannot trigger it, because the access-token cookie is SameSite=Lax.
export async function POST(request: NextRequest) {
  const appOrigin = getAppOrigin(request.nextUrl.origin);
  const form = await request.formData();
  const method = form.get('method');
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!isLinkableMethod(method)) {
    return appRedirect(appOrigin, LINK_RETURN_PATH, { link_error: 'link_failed' }, { hash: 'security' });
  }
  if (!accessToken) {
    return appRedirect(appOrigin, '/', {});
  }

  try {
    const [meResponse, nonceResponse] = await Promise.all([
      fetchBackendWithBearer(API_METHODS.auth.verify().endpoint, accessToken),
      fetchBackendWithBearer(API_METHODS.auth.linkNonce().endpoint, accessToken, { method: 'POST' }),
    ]);
    // A session the BE does not recognise is a changed session; a failed nonce is a plain failure.
    const me = await readBackendJson<{ id?: string }>(meResponse);
    if (!me?.id) {
      return appRedirect(appOrigin, LINK_RETURN_PATH, { link_error: 'link_session_changed' }, { hash: 'security' });
    }
    const nonce = await readBackendJson<{ nonce?: string }>(nonceResponse);
    if (!nonce?.nonce) {
      return appRedirect(appOrigin, LINK_RETURN_PATH, { link_error: 'link_failed' }, { hash: 'security' });
    }

    const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const { transaction, challenge } = createTransaction(LINK_RETURN_PATH, { userId: me.id });
    const authorizeUrl = buildAuthorizeUrl(getAuth0Config(), {
      redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}`,
      state: transaction.state,
      challenge,
      connection: AUTH0_CONNECTIONS[method],
      nonce: nonce.nonce,
      ...LINK_LOGIN,
      locale: isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE,
    });

    const response = NextResponse.redirect(authorizeUrl, 303);
    response.cookies.set(AUTH0_TXN_COOKIE, JSON.stringify(transaction), transactionCookieOptions());
    return response;
  } catch (error) {
    logger.error('Auth0 link start failed:', { error });
    return appRedirect(appOrigin, LINK_RETURN_PATH, { link_error: 'link_failed' }, { hash: 'security' });
  }
}
