import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  createTransaction,
  exchangeCode,
  parseTransaction,
  safeRedirectPath,
  statesMatch,
} from '@/libs/auth0';

vi.mock('@/libs/Env', () => ({ Env: {} }));

const config = { domain: 'tenant.example.auth0.com', clientId: 'cid', clientSecret: 'secret', audience: 'https://api.test' };

describe('createTransaction', () => {
  it('derives an S256 challenge from the verifier and never repeats', () => {
    const { transaction, challenge } = createTransaction('/dashboard');

    expect(challenge).toBe(createHash('sha256').update(transaction.verifier).digest('base64url'));
    expect(transaction.redirect).toBe('/dashboard');
    expect(createTransaction('/x').transaction.state).not.toBe(transaction.state);
  });
});

describe('parseTransaction', () => {
  it('round-trips a transaction and rejects garbage', () => {
    const { transaction } = createTransaction('/library');

    expect(parseTransaction(JSON.stringify(transaction))).toEqual(transaction);
    expect(parseTransaction('not json')).toBeNull();
    expect(parseTransaction(JSON.stringify({ state: 1 }))).toBeNull();
    expect(parseTransaction(undefined)).toBeNull();
  });
});

describe('statesMatch', () => {
  it('only accepts the exact state', () => {
    expect(statesMatch('abc', 'abc')).toBe(true);
    expect(statesMatch('abc', 'abd')).toBe(false);
    expect(statesMatch('abc', 'abcd')).toBe(false);
    expect(statesMatch('abc', null)).toBe(false);
  });
});

describe('safeRedirectPath', () => {
  it('keeps same-site paths and rejects anything that could leave the site', () => {
    expect(safeRedirectPath('/library?tab=1#x', '/dashboard')).toBe('/library?tab=1#x');
    expect(safeRedirectPath('//evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/\\evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('https://evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath(null, '/dashboard')).toBe('/dashboard');
  });
});

describe('buildAuthorizeUrl', () => {
  it('asks for code + PKCE with the API audience and offline access', () => {
    const url = new URL(buildAuthorizeUrl(config, { redirectUri: 'http://app/api/auth/callback', state: 's', challenge: 'c' }));

    expect(url.origin + url.pathname).toBe('https://tenant.example.auth0.com/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'cid',
      redirect_uri: 'http://app/api/auth/callback',
      audience: 'https://api.test',
      scope: 'openid profile email offline_access',
      state: 's',
      code_challenge: 'c',
      code_challenge_method: 'S256',
    });
  });

  it('tells Auth0 which language to show only when a locale is given', () => {
    const base = { redirectUri: 'r', state: 's', challenge: 'c' };

    expect(new URL(buildAuthorizeUrl(config, { ...base, locale: 'vi' })).searchParams.get('ui_locales')).toBe('vi');
    expect(new URL(buildAuthorizeUrl(config, base)).searchParams.has('ui_locales')).toBe(false);
  });

  it('adds the signup hint and the Google connection only when asked', () => {
    const url = new URL(buildAuthorizeUrl(config, { redirectUri: 'r', state: 's', challenge: 'c', signup: true, googleOnly: true }));

    expect(url.searchParams.get('screen_hint')).toBe('signup');
    expect(url.searchParams.get('connection')).toBe('google-oauth2');
  });
});

describe('buildLogoutUrl', () => {
  it('returns to the given URL', () => {
    const url = new URL(buildLogoutUrl(config, 'http://app/'));

    expect(url.origin + url.pathname).toBe('https://tenant.example.auth0.com/v2/logout');
    expect(url.searchParams.get('returnTo')).toBe('http://app/');
    expect(url.searchParams.get('client_id')).toBe('cid');
  });
});

describe('exchangeCode', () => {
  it('posts the code with the verifier and client secret', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ access_token: 'at', refresh_token: 'rt' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await exchangeCode(config, { code: 'c', verifier: 'v', redirectUri: 'r' })).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ grant_type: 'authorization_code', code: 'c', code_verifier: 'v', redirect_uri: 'r', client_secret: 'secret' });
    vi.unstubAllGlobals();
  });

  it('returns null when Auth0 refuses the code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 403 })));

    expect(await exchangeCode(config, { code: 'bad', verifier: 'v', redirectUri: 'r' })).toBeNull();
    vi.unstubAllGlobals();
  });
});
