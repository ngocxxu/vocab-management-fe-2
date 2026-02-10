'use client';

import type { TSubject } from '@/types/subject';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { Skeleton } from '@/components/ui/skeleton';

type SubjectsSectionProps = {
  targetIndex: number;
  subjects: TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
};

const SubjectsSection: React.FC<SubjectsSectionProps> = React.memo(({
  targetIndex,
  subjects,
  subjectsLoading,
  subjectsError,
}) => {
  const form = useFormContext();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Convert subjects to the format expected by MultiSelect (memoized to prevent re-renders)
  const subjectOptions = useMemo(() => subjects.map(subject => ({
    value: subject.id,
    label: subject.name,
  })), [subjects]);

  // Don't render until component is mounted on client
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">
          Subjects
        </h4>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Show loading state while fetching subjects
  if (subjectsLoading) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">
          Subjects
        </h4>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Show error state if subjects failed to load
  if (subjectsError) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">
          Subjects
        </h4>
        <div className="h-10 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Failed to load subjects. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">
        Subjects
      </h4>
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
                  // Clear validation error for this field when value changes
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
