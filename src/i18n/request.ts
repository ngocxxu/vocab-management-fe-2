import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from './config';

// Locale lives in a cookie, not the URL, so routes, auth redirects and OAuth callbacks stay unchanged.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`@/locales/${locale}.json`)).default,
  };
});
