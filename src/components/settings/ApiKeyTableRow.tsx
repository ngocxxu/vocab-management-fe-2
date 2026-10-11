'use client';

import type { ApiKeyTableRowProps } from '@/types/api-key';
import { TrashBin2 } from '@solar-icons/react/ssr';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCreatedDate } from '@/utils/subject';

// Scope values are sent to the backend as they are; only the label shown in the table is translated.
const SCOPE_LABEL_KEYS: Record<string, string> = {
  QUICK_ADD_VOCAB: 'quickAdd',
};

export const ApiKeyTableRow: React.FC<ApiKeyTableRowProps> = ({ apiKey, onDelete }) => {
  const t = useTranslations('settings.apiKeys');
  const locale = useLocale();

  return (
    <tr className="border-b border-border bg-card transition-colors hover:bg-muted/20">
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="font-semibold text-foreground">{apiKey.name}</div>
        <div className="font-mono text-sm text-muted-foreground">{apiKey.keyPrefix}</div>
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap gap-1">
          {apiKey.scopes.map(scope => (
            <Badge key={scope} variant="secondary" className="font-normal">
              {SCOPE_LABEL_KEYS[scope] ? t(SCOPE_LABEL_KEYS[scope]) : scope}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">
        {apiKey.languageFolder
          ? `${apiKey.languageFolder.name} (${apiKey.languageFolder.sourceLanguageCode} → ${apiKey.languageFolder.targetLanguageCode})`
          : '—'}
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">
        {formatCreatedDate(apiKey.createdAt, locale)}
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">
        {apiKey.lastUsedAt ? formatCreatedDate(apiKey.lastUsedAt, locale) : t('never')}
      </td>
      <td className="px-3 py-3 text-right sm:px-6 sm:py-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={t('deleteLabel')}
            >
              <TrashBin2 size={16} weight="BoldDuotone" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteDescription', { name: apiKey.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(apiKey.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
};
