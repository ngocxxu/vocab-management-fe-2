import type { TCsvImportResponse } from '@/types/vocab-list';

const SUBJECT_NOT_FOUND_PATTERN = /Subject '(.+)' not found/;

/** True when the file had problems and no word was created or updated. The user must fix the file or the subjects, then import again. */
export function isNothingSaved(result: Pick<TCsvImportResponse, 'created' | 'updated' | 'failed'>): boolean {
  return result.created === 0 && result.updated === 0 && result.failed > 0;
}

/** Subject name from a backend "Subject 'X' not found" error, or null for any other error. */
export function extractSubjectName(error: string): string | null {
  return SUBJECT_NOT_FOUND_PATTERN.exec(error)?.[1] ?? null;
}

/** Key and value pairs of a failed row that are worth showing. Null, undefined and blank values are hidden. */
export function getVisibleDataEntries(data: Record<string, unknown> | undefined): Array<[string, string]> {
  return Object.entries(data ?? {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]): [string, string] => [key, String(value)]);
}
