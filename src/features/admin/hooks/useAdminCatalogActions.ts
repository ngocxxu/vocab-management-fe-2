'use client';

import type { TAdminLanguage, TAdminLanguageInput, TAdminWordType, TAdminWordTypeInput } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { createAdminLanguage, createAdminWordType, deleteAdminLanguage, deleteAdminWordType, updateAdminLanguage, updateAdminWordType } from '@/actions/admin-catalog';
import { useAdminAction } from './useAdminAction';

type TAdminLanguageActions = {
  isPending: boolean;
  createLanguage: (input: TAdminLanguageInput, onSuccess: () => void) => void;
  saveLanguage: (language: TAdminLanguage, input: TAdminLanguageInput, onSuccess: () => void) => void;
  deleteLanguage: (language: TAdminLanguage, onSuccess: () => void) => void;
};

type TAdminWordTypeActions = {
  isPending: boolean;
  createWordType: (input: TAdminWordTypeInput, onSuccess: () => void) => void;
  saveWordType: (wordType: TAdminWordType, input: TAdminWordTypeInput, onSuccess: () => void) => void;
  deleteWordType: (wordType: TAdminWordType, onSuccess: () => void) => void;
};

/** Mutations for the languages table. Each runs a server action, shows a toast, and refreshes the rows. */
export function useAdminLanguageActions(): TAdminLanguageActions {
  const t = useTranslations('admin.languages');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));

  const createLanguage = useCallback((input: TAdminLanguageInput, onSuccess: () => void) => {
    runAction(() => createAdminLanguage(input), t('toast.created'), onSuccess);
  }, [runAction, t]);

  const saveLanguage = useCallback((language: TAdminLanguage, input: TAdminLanguageInput, onSuccess: () => void) => {
    runAction(() => updateAdminLanguage(language.id, input), t('toast.saved'), onSuccess);
  }, [runAction, t]);

  const deleteLanguage = useCallback((language: TAdminLanguage, onSuccess: () => void) => {
    runAction(() => deleteAdminLanguage(language.id), t('toast.deleted'), onSuccess);
  }, [runAction, t]);

  return { isPending, createLanguage, saveLanguage, deleteLanguage };
}

/** Mutations for the word types table. Each runs a server action, shows a toast, and refreshes the rows. */
export function useAdminWordTypeActions(): TAdminWordTypeActions {
  const t = useTranslations('admin.wordTypes');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));

  const createWordType = useCallback((input: TAdminWordTypeInput, onSuccess: () => void) => {
    runAction(() => createAdminWordType(input), t('toast.created'), onSuccess);
  }, [runAction, t]);

  const saveWordType = useCallback((wordType: TAdminWordType, input: TAdminWordTypeInput, onSuccess: () => void) => {
    runAction(() => updateAdminWordType(wordType.id, input), t('toast.saved'), onSuccess);
  }, [runAction, t]);

  const deleteWordType = useCallback((wordType: TAdminWordType, onSuccess: () => void) => {
    runAction(() => deleteAdminWordType(wordType.id), t('toast.deleted'), onSuccess);
  }, [runAction, t]);

  return { isPending, createWordType, saveWordType, deleteWordType };
}
