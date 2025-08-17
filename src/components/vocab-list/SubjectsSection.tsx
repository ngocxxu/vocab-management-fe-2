'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';

type Subject = {
  id: string;
  name: string;
};

type SubjectsSectionProps = {
  targetIndex: number;
};

const SUBJECTS: Subject[] = [
  { id: '1', name: 'Basic Greetings' },
  { id: '2', name: 'Politeness' },
  { id: '3', name: 'Farewells' },
  { id: '4', name: 'Requests' },
  { id: '5', name: 'Apologies' },
  { id: '6', name: 'Numbers' },
  { id: '7', name: 'Colors' },
  { id: '8', name: 'Family' },
];

const SubjectsSection: React.FC<SubjectsSectionProps> = ({
  targetIndex,
}) => {
  const form = useFormContext();

  // Convert subjects to the format expected by MultiSelect
  const subjectOptions = SUBJECTS.map(subject => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">
        Subjects for Vocab
        {' '}
        {targetIndex + 1}
      </h4>
      <FormField
        control={form?.control}
        name={`textTargets.${targetIndex}.subjectIds`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Subjects</FormLabel>
            <FormControl>
              <MultiSelect
                defaultValue={field.value || []}
                options={subjectOptions}
                onValueChange={field.onChange}
                placeholder="Choose subjects..."
                maxCount={4}
                searchable={true}
                className="w-full"
                asChild={true}
              >
                <div className="flex h-auto min-h-10 cursor-pointer items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit">
                  <span className="text-sm text-muted-foreground">
                    {field.value.length > 0
                      ? `${field.value.length} subject(s) selected`
                      : 'Choose subjects...'}
                  </span>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </MultiSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SubjectsSection;
