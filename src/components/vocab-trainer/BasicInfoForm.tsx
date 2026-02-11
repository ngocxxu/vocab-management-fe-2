'use client';

import { Bell } from '@solar-icons/react/ssr';
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
import { cn } from '@/libs/utils';

const BasicInfoForm: React.FC = () => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Basic Information
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trainer Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Morning Review #4"
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
          render={({ field }) => {
            const minutes = Math.floor(field.value / 60);
            const label = minutes === 1 ? '1 minute' : `${minutes} minutes`;
            return (
              <FormItem>
                <FormLabel>Time Limit</FormLabel>
                <div className="mt-1 flex flex-col gap-2">
                  <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {label}
                  </span>
                  <FormControl>
                    <Slider
                      min={60}
                      max={1800}
                      step={60}
                      value={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0]);
                        form.clearErrors('setCountTime');
                      }}
                      className="[&_[data-orientation=horizontal]]:bg-blue-200 dark:[&_[data-orientation=horizontal]]:bg-blue-900/50 [&_[data-orientation=horizontal]]:[&>span]:bg-blue-600"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="reminderDisabled"
          render={({ field }) => {
            const reminderEnabled = !field.value;
            return (
              <FormItem>
                <FormLabel className="sr-only">Enable Reminder</FormLabel>
                <FormControl>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={reminderEnabled}
                    onClick={() => {
                      field.onChange(!field.value);
                      form.clearErrors('reminderDisabled');
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-left transition-colors hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Bell size={20} weight="BoldDuotone" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Enable Reminder</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Remind at 09:00 AM
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        reminderEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform',
                          reminderEnabled ? 'translate-x-5' : 'translate-x-0.5',
                        )}
                        style={{ marginTop: 2 }}
                      />
                    </span>
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
