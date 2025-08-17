'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BasicInfoFormProps = {
  formData: {
    textSource: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
    textTargets: Array<{
      textTarget: string;
    }>;
  };
  onInputChange: (field: string, value: string, targetIndex?: number) => void;
};

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="sourceLanguage">Source Language</Label>
          <Select value={formData.sourceLanguageCode} onValueChange={(value: string) => onInputChange('sourceLanguageCode', value)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Vietnamese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetLanguage">Target Language</Label>
          <Select value={formData.targetLanguageCode} onValueChange={(value: string) => onInputChange('targetLanguageCode', value)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Vietnamese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="textSource">Source Text</Label>
          <Input
            id="textSource"
            placeholder="Enter source text..."
            value={formData.textSource}
            onChange={e => onInputChange('textSource', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="textTarget">Target Text</Label>
          <Input
            id="textTarget"
            placeholder="Enter target text..."
            value={formData.textTargets[0]?.textTarget || ''}
            onChange={e => onInputChange('textTarget', e.target.value, 0)}
            className="mt-1"
          />
        </div>

      </div>
    </div>
  );
};

export default BasicInfoForm;
