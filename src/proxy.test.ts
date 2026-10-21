import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextRequest as NextRequestClass } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import proxy from './proxy';

vi.mock('@/libs/Env', () => ({ Env: {} }));

const event = {} as NextFetchEvent;

describe('proxy: link form POST without a session', () => {
  it('answers 303 to the login route, so the browser follows it as a GET', async () => {
    const request = new NextRequestClass('http://app.test/api/auth/link', { method: 'POST' }) as NextRequest;

    const response = await proxy(request, event);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toMatch(/^http:\/\/app\.test\/api\/auth\/login\?/);
  });

  it('returns the User to the Profile page, not to the route handler (which has no GET)', async () => {
    const request = new NextRequestClass('http://app.test/api/auth/link', { method: 'POST' }) as NextRequest;

    const response = await proxy(request, event);

    const location = new URL(response.headers.get('location') ?? '');
    expect(location.searchParams.get('redirect')).toBe('/profile');
  });
});
