'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Subject = {
  id: string;
  name: string;
};

type SubjectsSectionProps = {
  targetIndex: number;
  selectedSubjectIds: string[];
  onSubjectChange: (subjectId: string, targetIndex: number) => void;
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
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">
        Subjects for Target
        {' '}
        {targetIndex + 1}
      </h4>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SUBJECTS.map(subject => (
          <div key={subject.id} className="flex items-center space-x-2">
            <Checkbox
              id={`subject-${targetIndex}-${subject.id}`}
              checked={selectedSubjectIds.includes(subject.id)}
              onCheckedChange={() => onSubjectChange(subject.id, targetIndex)}
            />
            <Label htmlFor={`subject-${targetIndex}-${subject.id}`} className="text-sm">
              {subject.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsSection;
