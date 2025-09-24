'use client';

import type { TCreateLanguageFolder } from '@/types/language-folder';
import { X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguages } from '@/hooks/useLanguages';

type CreateFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: TCreateLanguageFolder) => Promise<void>;
};

const FOLDER_COLORS = [
  { value: 'from-blue-500 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { value: 'from-purple-500 to-purple-600', label: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { value: 'from-green-500 to-green-600', label: 'Green', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
  { value: 'from-yellow-500 to-yellow-600', label: 'Yellow', preview: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
  { value: 'from-red-500 to-red-600', label: 'Red', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
  { value: 'from-indigo-500 to-indigo-600', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
  { value: 'from-pink-500 to-pink-600', label: 'Pink', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  { value: 'from-teal-500 to-teal-600', label: 'Teal', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' },
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const { languages, isLoading: isLoadingLanguages } = useLanguages();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TCreateLanguageFolder>({
    name: '',
    folderColor: 'from-blue-500 to-blue-600',
    sourceLanguageCode: '',
    targetLanguageCode: '',
  });
  const [errors, setErrors] = useState<Partial<TCreateLanguageFolder>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<TCreateLanguageFolder> = {};

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
      setIsSubmitting(true);
      await onCreateFolder(formData);
      toast.success('Language folder created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create language folder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onCreateFolder, onClose]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      folderColor: 'from-blue-500 to-blue-600',
      sourceLanguageCode: '',
      targetLanguageCode: '',
    });
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  }, [isSubmitting, onClose, resetForm]);

  const handleInputChange = useCallback((field: keyof TCreateLanguageFolder, value: string) => {
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Language Folder
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Source Language */}
          <div className="space-y-2">
            <Label htmlFor="source-language">Source Language</Label>
            <Select
              value={formData.sourceLanguageCode}
              onValueChange={value => handleInputChange('sourceLanguageCode', value)}
              disabled={isSubmitting || isLoadingLanguages}
            >
              <SelectTrigger className={errors.sourceLanguageCode ? 'border-red-500' : ''}>
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
              <SelectTrigger className={errors.targetLanguageCode ? 'border-red-500' : ''}>
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

          {/* Folder Color */}
          <div className="space-y-2">
            <Label>Folder Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('folderColor', color.value)}
                  disabled={isSubmitting}
                  className={`relative h-12 w-full rounded-lg ${color.preview} ${
                    formData.folderColor === color.value
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'hover:opacity-80'
                  } transition-all duration-200`}
                >
                  {formData.folderColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingLanguages}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
