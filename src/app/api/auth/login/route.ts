import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH0_CALLBACK_PATH, AUTH0_TXN_COOKIE, buildAuthorizeUrl, createTransaction, getAppOrigin, getAuth0Config, safeRedirectPath, transactionCookieOptions } from '@/libs/auth0';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from '@/i18n/config';
import { logger } from '@/libs/Logger';

// GET /api/auth/login - start Authorization Code + PKCE at Auth0 (?redirect=/path, ?mode=signup, ?connection=google)
export function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const appOrigin = getAppOrigin(origin);

  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  try {
    const config = getAuth0Config();
    const { transaction, challenge } = createTransaction(safeRedirectPath(searchParams.get('redirect'), '/dashboard'));
    const authorizeUrl = buildAuthorizeUrl(config, {
      redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}`,
      state: transaction.state,
      challenge,
      signup: searchParams.get('mode') === 'signup',
      googleOnly: searchParams.get('connection') === 'google',
      locale: isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE,
    });

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(AUTH0_TXN_COOKIE, JSON.stringify(transaction), transactionCookieOptions());
    return response;
  } catch (error) {
    logger.error('Auth0 login start failed:', { error });
    return NextResponse.redirect(new URL('/?auth_error=auth_not_configured', appOrigin));
  }
}
