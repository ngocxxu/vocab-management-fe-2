'use client';

import React from 'react';
import { MultiSelect } from '@/components/ui/multi-select';

type Subject = {
  id: string;
  name: string;
};

type SubjectsSectionProps = {
  targetIndex: number;
  selectedSubjectIds: string[];
  onSubjectChange: (subjectIds: string[]) => void;
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
  selectedSubjectIds,
  onSubjectChange,
}) => {
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
      <MultiSelect
        options={subjectOptions}
        value={selectedSubjectIds}
        onValueChange={onSubjectChange}
        placeholder="Choose subjects..."
        maxCount={4}
        searchable={true}
        className="w-full"
        asChild={true}
      >
        <div className="flex h-auto min-h-10 cursor-pointer items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit">
          <span className="text-sm text-muted-foreground">
            {selectedSubjectIds.length > 0
              ? `${selectedSubjectIds.length} subject(s) selected`
              : 'Choose subjects...'}
          </span>
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </MultiSelect>
    </div>
  );
};

export default SubjectsSection;
