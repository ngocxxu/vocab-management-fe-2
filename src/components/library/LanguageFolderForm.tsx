'use client';

import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/libs/utils';

import type {
  LanguageFolderFormData,
  LanguageFolderFormErrors,
  LanguageFolderFormProps,
} from '@/types/language-folder';

export type { LanguageFolderFormData, LanguageFolderFormErrors };

const LanguageFolderForm: React.FC<LanguageFolderFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText,
  cancelButtonText,
  isSubmitting = false,
  showAutoGenerate = false,
  className,
  initialLanguagesData,
}) => {
  const t = useTranslations('library.form');
  const languages = initialLanguagesData?.items || [];
  const isLoadingLanguages = false;
  const [formData, setFormData] = useState<LanguageFolderFormData>({
    name: '',
    folderColor: '#1a73e8',
    sourceLanguageCode: '',
    targetLanguageCode: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<LanguageFolderFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: LanguageFolderFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('nameTooShort');
    }

    if (!formData.sourceLanguageCode) {
      newErrors.sourceLanguageCode = t('sourceRequired');
    }

    if (!formData.targetLanguageCode) {
      newErrors.targetLanguageCode = t('targetRequired');
    }

    if (formData.sourceLanguageCode === formData.targetLanguageCode) {
      newErrors.targetLanguageCode = t('targetDifferent');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error; // Re-throw to let parent handle the error
    }
  }, [formData, validateForm, onSubmit]);

  const handleInputChange = useCallback((field: keyof LanguageFolderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const generateFolderName = useCallback(() => {
    if (formData.sourceLanguageCode && formData.targetLanguageCode && languages) {
      const sourceLang = languages.find(lang => lang.code === formData.sourceLanguageCode);
      const targetLang = languages.find(lang => lang.code === formData.targetLanguageCode);

      if (sourceLang && targetLang) {
        const generatedName = `${sourceLang.name} → ${targetLang.name}`;
        setFormData(prev => ({ ...prev, name: generatedName }));
      }
    }
  }, [formData.sourceLanguageCode, formData.targetLanguageCode, languages]);

  const availableTargetLanguages = languages?.filter(lang => lang.code !== formData.sourceLanguageCode) || [];

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Folder Name */}
      <div className="space-y-2">
        <Label htmlFor="folder-name">{t('folderName')}</Label>
        <div className="flex gap-2">
          <Input
            id="folder-name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder={t('folderNamePlaceholder')}
            className={errors.name ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          {showAutoGenerate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateFolderName}
              disabled={!formData.sourceLanguageCode || !formData.targetLanguageCode || isSubmitting}
              className="whitespace-nowrap"
            >
              {t('autoGenerate')}
            </Button>
          )}
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Languages */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Source Language */}
        <div className="space-y-2">
          <Label htmlFor="source-language">{t('sourceLanguage')}</Label>
          <Select
            value={formData.sourceLanguageCode}
            onValueChange={value => handleInputChange('sourceLanguageCode', value)}
            disabled={isSubmitting || isLoadingLanguages}
          >
            <SelectTrigger className={cn('w-full', errors.sourceLanguageCode ? 'border-destructive' : '')}>
              <SelectValue placeholder={t('selectSource')} />
            </SelectTrigger>
            <SelectContent>
              {languages?.map(language => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sourceLanguageCode && (
            <p className="text-sm text-destructive">{errors.sourceLanguageCode}</p>
          )}
        </div>

        {/* Target Language */}
        <div className="space-y-2">
          <Label htmlFor="target-language">{t('targetLanguage')}</Label>
          <Select
            value={formData.targetLanguageCode}
            onValueChange={value => handleInputChange('targetLanguageCode', value)}
            disabled={isSubmitting || isLoadingLanguages}
          >
            <SelectTrigger className={cn('w-full', errors.targetLanguageCode ? 'border-destructive' : '')}>
              <SelectValue placeholder={t('selectTarget')} />
            </SelectTrigger>
            <SelectContent>
              {availableTargetLanguages.map(language => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.targetLanguageCode && (
            <p className="text-sm text-destructive">{errors.targetLanguageCode}</p>
          )}
        </div>
      </div>

      {/* Folder Color */}
      <div className="space-y-2">
        <Label>{t('folderColor')}</Label>
        <ColorPicker
          value={formData.folderColor}
          onChange={color => handleInputChange('folderColor', color)}
          disabled={isSubmitting}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelButtonText ?? t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingLanguages}
        >
          {isSubmitting ? t('saving') : (submitButtonText ?? t('save'))}
        </Button>
      </div>
    </form>
  );
};

export default LanguageFolderForm;
