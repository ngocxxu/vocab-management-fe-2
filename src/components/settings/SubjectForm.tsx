'use client';

import type { SubjectFormProps } from '@/types/subject';
import { CheckCircle, CloseCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSubmit, onCancel, isLoading }) => {
  const t = useTranslations('subjects');
  const [formData, setFormData] = useState({
    name: subject?.name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('form.nameRequired'));
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          {t('form.subjectName')}
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('form.placeholder')}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <CloseCircle size={16} weight="BoldDuotone" className="mr-2" />
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          <CheckCircle size={16} weight="BoldDuotone" className="mr-2" />
          {isLoading ? t('form.saving') : subject ? t('form.update') : t('form.create')}
        </Button>
      </div>
    </form>
  );
};
