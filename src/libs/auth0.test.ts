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
  it('marks a link transaction with its purpose and the User who started it', () => {
    const { transaction } = createTransaction('/profile', { userId: 'user-1' });

    expect(transaction).toMatchObject({ purpose: 'link', userId: 'user-1', redirect: '/profile' });
    expect(createTransaction('/profile').transaction).not.toHaveProperty('purpose');
  });

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

  it('keeps a link transaction, and ignores a purpose that has no User behind it', () => {
    const { transaction } = createTransaction('/profile', { userId: 'user-1' });

    expect(parseTransaction(JSON.stringify(transaction))).toEqual(transaction);
    expect(parseTransaction(JSON.stringify({ ...transaction, userId: undefined }))).not.toHaveProperty('purpose');
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

describe('buildAuthorizeUrl for a link', () => {
  it('forces a fresh sign-in on the chosen connection and carries the BE nonce', () => {
    const url = new URL(buildAuthorizeUrl(config, {
      redirectUri: 'r',
      state: 's',
      challenge: 'c',
      connection: 'Username-Password-Authentication',
      nonce: 'n-1',
      forceLogin: true,
      maxAgeSeconds: 300,
      scope: 'openid profile email',
    }));

    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      connection: 'Username-Password-Authentication',
      nonce: 'n-1',
      prompt: 'login',
      max_age: '300',
      scope: 'openid profile email',
    });
  });

  it('sends none of those for an ordinary login', () => {
    const url = new URL(buildAuthorizeUrl(config, { redirectUri: 'r', state: 's', challenge: 'c' }));

    expect(['nonce', 'prompt', 'max_age', 'connection'].some(name => url.searchParams.has(name))).toBe(false);
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

    expect(await exchangeCode(config, { code: 'c', verifier: 'v', redirectUri: 'r' })).toEqual({ accessToken: 'at', refreshToken: 'rt', idToken: null });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ grant_type: 'authorization_code', code: 'c', code_verifier: 'v', redirect_uri: 'r', client_secret: 'secret' });
    vi.unstubAllGlobals();
  });

  it('returns the ID token when Auth0 sends one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ access_token: 'at', id_token: 'idt' }), { status: 200 })));

    expect(await exchangeCode(config, { code: 'c', verifier: 'v', redirectUri: 'r' })).toMatchObject({ idToken: 'idt' });
    vi.unstubAllGlobals();
  });

  it('returns null when Auth0 refuses the code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 403 })));

    expect(await exchangeCode(config, { code: 'bad', verifier: 'v', redirectUri: 'r' })).toBeNull();
    vi.unstubAllGlobals();
  });
});
