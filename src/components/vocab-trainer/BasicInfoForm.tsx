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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';

const BasicInfoForm: React.FC = () => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trainer Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter trainer name..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors('name');
                  }}
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="questionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.clearErrors('questionType');
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUESTION_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setCountTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Time Limit:
                  {' '}
                  {Math.floor(field.value / 60)}
                  {' '}
                  {Math.floor(field.value / 60) === 1 ? 'minute' : 'minutes'}
                  {field.value % 60 !== 0 && ` ${field.value % 60}s`}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={10}
                    max={1800}
                    step={10}
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      form.clearErrors('setCountTime');
                    }}
                    className="mt-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reminderDisabled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enable Reminder</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === 'true');
                  form.clearErrors('reminderDisabled');
                }}
                value={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="false">Yes</SelectItem>
                  <SelectItem value="true">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
