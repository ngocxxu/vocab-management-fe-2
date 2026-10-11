export const LOCALES = ['en', 'vi'] as const;

export type TLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: TLocale = 'en';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<TLocale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export function isLocale(value: unknown): value is TLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
