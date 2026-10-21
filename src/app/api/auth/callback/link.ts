import type { TAuth0Transaction } from '@/libs/auth0';
import type { NextResponse } from 'next/server';
import { isAccountErrorCode } from '@/constants/auth';
import { AUTH0_CALLBACK_PATH, exchangeCode, getAuth0Config } from '@/libs/auth0';
import { logger } from '@/libs/Logger';
import { API_METHODS } from '@/utils/api-config';
import { appRedirect } from '../link-result';
import { fetchBackendWithBearer, parseBackendResponse, readBackendJson } from '../session-response';

function done(appOrigin: string, transaction: TAuth0Transaction, result: { link: 'success' } | { link_error: string }): NextResponse {
  const [name, value] = Object.entries(result)[0] as [string, string];
  return appRedirect(appOrigin, transaction.redirect, { [name]: value }, { hash: 'security', clearTransaction: true });
}

async function currentUserId(accessToken: string): Promise<string | null> {
  const body = await readBackendJson<{ id?: string }>(await fetchBackendWithBearer(API_METHODS.auth.verify().endpoint, accessToken));
  return typeof body?.id === 'string' ? body.id : null;
}

/** A link that did not get as far as the BE: Auth0 refused or the user cancelled, or the state did not match. */
export function linkFailed(appOrigin: string, transaction: TAuth0Transaction): NextResponse {
  return done(appOrigin, transaction, { link_error: 'link_failed' });
}

/**
 * Finishes a link started by /api/auth/link. The User's own session stays as it is: no access or refresh cookie is written,
 * because the tokens Auth0 just returned belong to the other sign-in method. The ID token is only handed to the BE as proof.
 */
export async function finishLink(appOrigin: string, transaction: TAuth0Transaction, code: string, accessToken: string | undefined): Promise<NextResponse> {
  try {
    // The session must still be the User who started the link, or a different person could attach their login to someone else.
    if (!accessToken || !transaction.userId || (await currentUserId(accessToken)) !== transaction.userId) {
      return done(appOrigin, transaction, { link_error: 'link_session_changed' });
    }

    const tokens = await exchangeCode(getAuth0Config(), { code, verifier: transaction.verifier, redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}` });
    if (!tokens?.idToken) {
      return done(appOrigin, transaction, { link_error: 'link_failed' });
    }

    const response = await fetchBackendWithBearer(API_METHODS.auth.link({ idToken: tokens.idToken }).endpoint, accessToken, {
      method: 'POST',
      body: { idToken: tokens.idToken },
    });
    if (response.ok) {
      return done(appOrigin, transaction, { link: 'success' });
    }
    // The refusal's message is the code, so the body is read whatever the status.
    const body = await parseBackendResponse<{ message?: unknown }>(response);
    const message = typeof body.message === 'string' ? body.message : '';
    logger.warn('Account link rejected:', { status: response.status, message });
    return done(appOrigin, transaction, { link_error: isAccountErrorCode(message) ? message : 'link_failed' });
  } catch (error) {
    logger.error('Account link failed:', { error });
    return done(appOrigin, transaction, { link_error: 'link_failed' });
  }
}
