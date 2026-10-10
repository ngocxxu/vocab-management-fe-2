'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { TLocale } from '@/i18n/config';
import { isLocale, LOCALE_COOKIE_NAME } from '@/i18n/config';

// One year. The cookie holds no secret, so unlike the auth cookies it is readable by client JS.
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Stores the chosen UI language. Unknown values are rejected instead of being written to the cookie. */
export async function setLocale(locale: TLocale): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error('Unsupported locale');
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  // The layout reads the cookie, so the whole tree re-renders in the new language.
  revalidatePath('/', 'layout');
}
