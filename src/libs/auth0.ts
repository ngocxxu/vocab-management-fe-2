import { Buffer } from 'node:buffer';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Env } from '@/libs/Env';

export const AUTH0_TXN_COOKIE = 'auth0_txn';
export const AUTH0_TXN_MAX_AGE_SECONDS = 600;
export const AUTH0_CALLBACK_PATH = '/api/auth/callback';
const SCOPE = 'openid profile email offline_access';
const REQUEST_TIMEOUT_MS = 10_000;

export type TAuth0Config = {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
};

export type TAuth0Transaction = {
  state: string;
  verifier: string;
  redirect: string;
};

export type TAuth0Tokens = {
  accessToken: string;
  refreshToken: string | null;
};

/** Reads the Auth0 settings; throws (never returns a half-filled config) so a misconfigured deploy fails loudly. */
export function getAuth0Config(): TAuth0Config {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } = Env;
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    throw new Error('Auth0 is not configured: set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET and AUTH0_AUDIENCE');
  }
  return {
    domain: AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
  };
}

/** Public origin of this app. NEXT_PUBLIC_APP_URL wins because the request origin is wrong behind some proxies. */
export function getAppOrigin(requestOrigin: string): string {
  return (Env.NEXT_PUBLIC_APP_URL || requestOrigin).replace(/\/+$/, '');
}

/** Only same-site relative paths are allowed, so the redirect target cannot send a user off-site. */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  try {
    const url = new URL(value, 'http://local.app');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function createTransaction(redirect: string): { transaction: TAuth0Transaction; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return {
    transaction: { state: randomBytes(16).toString('base64url'), verifier, redirect },
    challenge: createHash('sha256').update(verifier).digest('base64url'),
  };
}

export function parseTransaction(raw: string | undefined): TAuth0Transaction | null {
  if (!raw) {
    return null;
  }
  try {
    const value = JSON.parse(raw) as Partial<TAuth0Transaction>;
    if (typeof value.state === 'string' && typeof value.verifier === 'string' && typeof value.redirect === 'string') {
      return { state: value.state, verifier: value.verifier, redirect: value.redirect };
    }
  } catch {}
  return null;
}

export function statesMatch(expected: string, received: string | null): boolean {
  if (!received) {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildAuthorizeUrl(
  config: TAuth0Config,
  params: { redirectUri: string; state: string; challenge: string; signup?: boolean; googleOnly?: boolean; locale?: string },
): string {
  const url = new URL(`https://${config.domain}/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('audience', config.audience);
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('state', params.state);
  url.searchParams.set('code_challenge', params.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (params.signup) {
    url.searchParams.set('screen_hint', 'signup');
  }
  if (params.googleOnly) {
    url.searchParams.set('connection', 'google-oauth2');
  }
  // Universal Login does not read the app's locale cookie; this tells Auth0 which language to show.
  if (params.locale) {
    url.searchParams.set('ui_locales', params.locale);
  }
  return url.toString();
}

export function buildLogoutUrl(config: TAuth0Config, returnTo: string): string {
  const url = new URL(`https://${config.domain}/v2/logout`);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}

async function requestTokens(config: TAuth0Config, body: Record<string, string>): Promise<{ status: number; data: Record<string, unknown> }> {
  const response = await fetch(`https://${config.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, ...body }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  return { status: response.status, data };
}

function readTokens(data: Record<string, unknown>): TAuth0Tokens | null {
  if (typeof data.access_token !== 'string' || data.access_token.length === 0) {
    return null;
  }
  return { accessToken: data.access_token, refreshToken: typeof data.refresh_token === 'string' && data.refresh_token ? data.refresh_token : null };
}

/** Returns null on any failure; the caller only needs to know the login did not work. */
export async function exchangeCode(config: TAuth0Config, params: { code: string; verifier: string; redirectUri: string }): Promise<TAuth0Tokens | null> {
  const { status, data } = await requestTokens(config, {
    grant_type: 'authorization_code',
    code: params.code,
    code_verifier: params.verifier,
    redirect_uri: params.redirectUri,
  });
  return status === 200 ? readTokens(data) : null;
}

/** With rotation on, Auth0 returns a new refresh token; without it the old one stays valid. */
export async function refreshTokens(config: TAuth0Config, refreshToken: string): Promise<TAuth0Tokens | null> {
  const { status, data } = await requestTokens(config, { grant_type: 'refresh_token', refresh_token: refreshToken });
  const tokens = status === 200 ? readTokens(data) : null;
  return tokens && { ...tokens, refreshToken: tokens.refreshToken ?? refreshToken };
}
