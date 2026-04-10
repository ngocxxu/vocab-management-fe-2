'use client';

import type { SubjectsSectionProps } from '@/types/vocab-list';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { MultiSelect } from '@/shared/ui/multi-select';
import { Skeleton } from '@/shared/ui/skeleton';

const SubjectsSection: React.FC<SubjectsSectionProps> = React.memo(({
  targetIndex,
  subjects,
  subjectsLoading,
  subjectsError,
}) => {
  const form = useFormContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const subjectOptions = useMemo(() => subjects.map(subject => ({
    value: subject.id,
    label: subject.name,
  })), [subjects]);

  if (!isMounted || subjectsLoading) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Subjects</h4>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (subjectsError) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Subjects</h4>
        <div className="h-10 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load subjects. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Subjects</h4>
      <FormField
        control={form?.control}
        name={`textTargets.${targetIndex}.subjectIds`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Subjects</FormLabel>
            <FormControl>
              <MultiSelect
                options={subjectOptions}
                defaultValue={field.value || []}
                onValueChange={(newValue) => {
                  field.onChange(newValue);
                  form.clearErrors(`textTargets.${targetIndex}.subjectIds`);
                }}
                placeholder="Choose subjects..."
                maxCount={4}
                disabled={subjectsLoading}
                className="w-full"
                resetOnDefaultValueChange={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});

SubjectsSection.displayName = 'SubjectsSection';

export default SubjectsSection;
