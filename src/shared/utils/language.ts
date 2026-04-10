const LANGUAGE_NAMES: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  vi: 'Vietnamese',
  ja: 'Japanese',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
};

export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}
