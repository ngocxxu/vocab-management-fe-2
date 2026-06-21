'use client';

import type { SubjectFormProps } from '@/types/subject';
import type { TLanguage } from '@/types';
import { CheckCircle, CloseCircle } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSubmit, onCancel, isLoading, initialLanguagesData }) => {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    targetLanguageCode: subject?.targetLanguageCode || '',
  });

  const languages: TLanguage[] = initialLanguagesData?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (!formData.targetLanguageCode) {
      toast.error('Target language is required');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          Subject Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter subject name"
          required
        />
      </div>
      <div>
        <label htmlFor="targetLanguageCode" className="mb-2 block text-sm font-medium text-foreground">
          Target Language
        </label>
        <Select
          value={formData.targetLanguageCode}
          onValueChange={value => setFormData(prev => ({ ...prev, targetLanguageCode: value }))}
        >
          <SelectTrigger id="targetLanguageCode" className="mt-1 w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.length === 0
              ? (
                  <SelectItem value="loading" disabled>
                    No languages available
                  </SelectItem>
                )
              : languages.map((language: TLanguage) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <CloseCircle size={16} weight="BoldDuotone" className="mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <CheckCircle size={16} weight="BoldDuotone" className="mr-2" />
          {isLoading ? 'Saving...' : subject ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
