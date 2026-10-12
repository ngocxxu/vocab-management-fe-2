'use client';

import type { TAdminLanguage } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { isLanguageInUse } from '../utils/catalog-usage';

type TLanguageRowActionsProps = Readonly<{
  language: TAdminLanguage;
  isPending: boolean;
  onRename: () => void;
  onDelete: () => void;
}>;

/** Rename always works. Delete is locked while a vocab or folder uses the language, and the hint says why. */
export function LanguageRowActions({ language, isPending, onRename, onDelete }: TLanguageRowActionsProps) {
  const t = useTranslations('admin.languages');
  const inUse = isLanguageInUse(language);
  const hint = t('inUseHint', { vocabCount: language.vocabCount, folderCount: language.folderCount });

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={isPending} onClick={onRename}>
        {t('rename')}
      </Button>
      {inUse
        ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <span className="pointer-events-none inline-flex">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled>
                      {t('delete')}
                    </Button>
                  </span>
                  <span className="sr-only">{hint}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{hint}</TooltipContent>
            </Tooltip>
          )
        : (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending} onClick={onDelete}>
              {t('delete')}
            </Button>
          )}
    </div>
  );
}
