'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguages } from '@/hooks/useLanguages';
import { cn } from '@/libs/utils';

export type LanguageFolderFormData = {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

export type LanguageFolderFormErrors = Partial<LanguageFolderFormData>;

type LanguageFolderFormProps = {
  initialData?: Partial<LanguageFolderFormData>;
  onSubmit: (data: LanguageFolderFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isSubmitting?: boolean;
  showAutoGenerate?: boolean;
  className?: string;
};

const LanguageFolderForm: React.FC<LanguageFolderFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Save',
  cancelButtonText = 'Cancel',
  isSubmitting = false,
  showAutoGenerate = false,
  className,
}) => {
  const { languages, isLoading: isLoadingLanguages } = useLanguages();
  const [formData, setFormData] = useState<LanguageFolderFormData>({
    name: '',
    folderColor: '#3b82f6',
    sourceLanguageCode: '',
    targetLanguageCode: '',
    ...initialData,
  });
  const [errors, setErrors] = useState<LanguageFolderFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: LanguageFolderFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Folder name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Folder name must be at least 2 characters';
    }

    if (!formData.sourceLanguageCode) {
      newErrors.sourceLanguageCode = 'Source language is required';
    }

    if (!formData.targetLanguageCode) {
      newErrors.targetLanguageCode = 'Target language is required';
    }

    if (formData.sourceLanguageCode === formData.targetLanguageCode) {
      newErrors.targetLanguageCode = 'Target language must be different from source language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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
        <Label htmlFor="folder-name">Folder Name</Label>
        <div className="flex gap-2">
          <Input
            id="folder-name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="Enter folder name"
            className={errors.name ? 'border-red-500' : ''}
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
              Auto Generate
            </Button>
          )}
        </div>
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Languages */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Source Language */}
        <div className="space-y-2">
          <Label htmlFor="source-language">Source Language</Label>
          <Select
            value={formData.sourceLanguageCode}
            onValueChange={value => handleInputChange('sourceLanguageCode', value)}
            disabled={isSubmitting || isLoadingLanguages}
          >
            <SelectTrigger className={cn('w-full', errors.sourceLanguageCode ? 'border-red-500' : '')}>
              <SelectValue placeholder="Select source language" />
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
            <p className="text-sm text-red-500">{errors.sourceLanguageCode}</p>
          )}
        </div>

        {/* Target Language */}
        <div className="space-y-2">
          <Label htmlFor="target-language">Target Language</Label>
          <Select
            value={formData.targetLanguageCode}
            onValueChange={value => handleInputChange('targetLanguageCode', value)}
            disabled={isSubmitting || isLoadingLanguages}
          >
            <SelectTrigger className={cn('w-full', errors.targetLanguageCode ? 'border-red-500' : '')}>
              <SelectValue placeholder="Select target language" />
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
            <p className="text-sm text-red-500">{errors.targetLanguageCode}</p>
          )}
        </div>
      </div>

      {/* Folder Color */}
      <div className="space-y-2">
        <Label>Folder Color</Label>
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
          {cancelButtonText}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingLanguages}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default LanguageFolderForm;
