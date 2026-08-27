/**
 * URL reduction helpers for Sentry payloads.
 *
 * Query strings carry Supabase OAuth `code`/`state`, signed asset URLs and
 * search terms. They are stripped everywhere, in every environment — there is
 * no case where a query string is worth more than the risk of shipping one.
 *
 * Both functions fall back to a substring cut when the input will not parse,
 * so a malformed URL still loses its query rather than passing through intact.
 */

/** Absolute URL reduced to origin + pathname. For client-side event URLs. */
export function toOriginAndPathname(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const base = typeof window === 'undefined' ? undefined : window.location.origin;
    const parsed = new URL(url, base);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

/** Absolute URL reduced to pathname only. For server-side request context. */
export function toPathname(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0];
  }
}
