const TRAINER_SCOPE_STORAGE_KEY = 'vocab-trainer:last-scope';

const ALL_SCOPE = 'ALL';

export type TTrainerLanguageScope = {
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

function isTrainerLanguageScope(value: unknown): value is TTrainerLanguageScope {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as Record<string, unknown>).sourceLanguageCode === 'string'
    && typeof (value as Record<string, unknown>).targetLanguageCode === 'string'
  );
}

export function getLastTrainerScope(): TTrainerLanguageScope | null {
  try {
    const raw = localStorage.getItem(TRAINER_SCOPE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isTrainerLanguageScope(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setLastTrainerScope(scope: TTrainerLanguageScope): void {
  try {
    localStorage.setItem(TRAINER_SCOPE_STORAGE_KEY, JSON.stringify(scope));
  } catch {
  }
}

export function isAllScope(sourceLanguageCode: string, targetLanguageCode: string): boolean {
  return sourceLanguageCode === ALL_SCOPE && targetLanguageCode === ALL_SCOPE;
}

export function scopeParam(code: string): string | undefined {
  return code === ALL_SCOPE ? undefined : code;
}

export function folderMatchesScope(
  folder: { sourceLanguageCode: string; targetLanguageCode: string },
  sourceLanguageCode: string,
  targetLanguageCode: string,
): boolean {
  return (
    (sourceLanguageCode === ALL_SCOPE || folder.sourceLanguageCode === sourceLanguageCode)
    && (targetLanguageCode === ALL_SCOPE || folder.targetLanguageCode === targetLanguageCode)
  );
}
