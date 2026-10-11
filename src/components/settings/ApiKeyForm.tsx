'use client';

import type { ApiKeyFormProps } from '@/types/api-key';
import type { TLanguageFolder } from '@/types/language-folder';
import { CheckCircle, CloseCircle, Refresh } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getMyLanguageFoldersForSelection } from '@/actions/language-folders';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const t = useTranslations('settings.apiKeys');
  const tErrors = useTranslations('errors');
  const [name, setName] = useState('');
  const [quickAddChecked, setQuickAddChecked] = useState(false);
  const [languageFolderId, setLanguageFolderId] = useState<string | undefined>(undefined);
  const [folders, setFolders] = useState<TLanguageFolder[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [hasFetchedFolders, setHasFetchedFolders] = useState(false);

  const fetchFolders = useCallback(async () => {
    setIsFoldersLoading(true);
    try {
      const result = await getMyLanguageFoldersForSelection({ page: 1, pageSize: 100 });
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      setFolders(result.items);
    } catch {
      toast.error(tErrors('loadLanguageFolders'));
    } finally {
      setIsFoldersLoading(false);
      setHasFetchedFolders(true);
    }
  }, [tErrors]);

  useEffect(() => {
    if (!quickAddChecked || hasFetchedFolders) {
      return;
    }
    fetchFolders();
  }, [quickAddChecked, hasFetchedFolders, fetchFolders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }
    if (!quickAddChecked) {
      toast.error(t('selectPermission'));
      return;
    }
    if (!languageFolderId) {
      toast.error(t('selectFolderRequired'));
      return;
    }
    await onSubmit({ name, scopes: ['QUICK_ADD_VOCAB'], languageFolderId });
  };

  const canSubmit = name.trim().length > 0 && quickAddChecked && !!languageFolderId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="api-key-name" className="mb-2 block text-sm font-medium text-foreground">
          {t('keyName')}
        </Label>
        <Input
          id="api-key-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('keyNamePlaceholder')}
          required
        />
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-foreground">{t('permissions')}</span>
        <div className="flex items-start gap-2">
          <Checkbox
            id="scope-quick-add"
            checked={quickAddChecked}
            onCheckedChange={checked => setQuickAddChecked(checked === true)}
          />
          <Label htmlFor="scope-quick-add" className="font-normal">
            {t('quickAdd')}
            <span className="block text-xs text-muted-foreground">{t('quickAddHint')}</span>
          </Label>
        </div>
      </div>

      {quickAddChecked && (
        <div>
          <Label htmlFor="api-key-folder" className="mb-2 block text-sm font-medium text-foreground">
            {t('targetFolder')}
          </Label>
          {isFoldersLoading
            ? (
                <p className="text-sm text-muted-foreground">{t('loadingFolders')}</p>
              )
            : folders.length === 0
              ? (
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <p className="text-sm text-muted-foreground">
                      {t('noFolder')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href="/library" target="_blank" rel="noopener noreferrer">{t('goToLibrary')}</Link>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={fetchFolders}>
                        <Refresh size={16} weight="BoldDuotone" className="mr-2" />
                        {t('refresh')}
                      </Button>
                    </div>
                  </div>
                )
              : (
                  <Select value={languageFolderId} onValueChange={setLanguageFolderId}>
                    <SelectTrigger id="api-key-folder" className="w-full">
                      <SelectValue placeholder={t('selectFolder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                          {' '}
                          (
                          {folder.sourceLanguageCode}
                          {' '}
                          →
                          {' '}
                          {folder.targetLanguageCode}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <CloseCircle size={16} weight="BoldDuotone" className="mr-2" />
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isLoading || !canSubmit}>
          <CheckCircle size={16} weight="BoldDuotone" className="mr-2" />
          {isLoading ? t('creating') : t('createSubmit')}
        </Button>
      </div>
    </form>
  );
};
