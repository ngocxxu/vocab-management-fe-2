import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/library', '/vocab-list', '/vocab-trainer', '/profile', '/subjects', '/notifications'];
const authRoutes = ['/signin', '/signup', '/forgot-password'];
const publicRoutes = ['/auth/callback'];

export default async function proxy(
  request: NextRequest,
  _event: NextFetchEvent,
) {
  const { pathname } = request.nextUrl;

  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in proxy
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes without authentication checks
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the accessToken from cookies
  const token = request.cookies.get('accessToken')?.value;

  // If accessing a protected route without a token, redirect to signin
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/signin', request.url);
    // Include both pathname and search params in redirect
    const fullPath = `${pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set('redirect', fullPath);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth routes with a token, redirect to dashboard
  if (isAuthRoute && token) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  ],
};
