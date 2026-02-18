'use client';

import type { SubjectFormProps } from '@/types/subject';
import { CheckCircle, CloseCircle } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
