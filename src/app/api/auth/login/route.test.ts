import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/libs/Env', () => ({
  Env: {
    AUTH0_DOMAIN: 'tenant.example.auth0.com',
    AUTH0_CLIENT_ID: 'cid',
    AUTH0_CLIENT_SECRET: 'secret',
    AUTH0_AUDIENCE: 'https://api.test',
    NEXT_PUBLIC_APP_URL: 'http://app.test',
  },
}));
vi.mock('@/libs/Logger', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const APP = 'http://app.test';

function login(cookie?: string): NextRequest {
  return new NextRequest(`${APP}/api/auth/login`, { headers: cookie ? { cookie } : {} });
}

describe('gET /api/auth/login', () => {
  it('reuses an Auth0 session by default', () => {
    const response = GET(login());

    const authorize = new URL(response.headers.get('location') ?? '');
    expect(authorize.searchParams.get('prompt')).toBeNull();
  });

  it('forces Auth0 to ask for credentials after a failed sign-in, and consumes the marker', () => {
    const response = GET(login('freshLogin=1'));

    const authorize = new URL(response.headers.get('location') ?? '');
    expect(authorize.searchParams.get('prompt')).toBe('login');
    expect(response.cookies.get('freshLogin')?.value).toBe('');
  });
});
