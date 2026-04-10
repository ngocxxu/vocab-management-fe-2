'use client';

import { Archive, Bell, CloseCircle, Lock } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
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
import { UserRole } from '@/constants/auth';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { UpsellModal } from '@/components/premium/UpsellModal';

type TrainerBasicInfoFormProps = Readonly<{
  userRole?: string;
  selectedWords?: Array<{ id: string; label?: string }>;
}>;

const MAX_VISIBLE_SELECTED_WORDS = 20;
const EMPTY_SELECTED_WORDS: TrainerBasicInfoFormProps['selectedWords'] = [];

const TrainerBasicInfoForm: React.FC<TrainerBasicInfoFormProps> = ({ userRole, selectedWords = EMPTY_SELECTED_WORDS }) => {
  const form = useFormContext();
  const [upsellOpen, setUpsellOpen] = useState(false);
  const isGuest = userRole === UserRole.GUEST;

  const removeSelectedWord = (id: string) => {
    const current = (form.getValues('vocabAssignmentIds') as string[]) || [];
    const next = current.filter(x => x !== id);
    form.setValue('vocabAssignmentIds', next, { shouldDirty: true, shouldValidate: true });
    if (next.length > 0) {
      form.clearErrors('vocabAssignmentIds');
    }
  };

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
                  if (value === EQuestionType.TRANSLATION_AUDIO && isGuest) {
                    setUpsellOpen(true);
                    return;
                  }
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
                      {option.value === EQuestionType.TRANSLATION_AUDIO && isGuest
                        ? (
                            <span className="flex w-full items-center justify-between gap-3">
                              <span>{option.label}</span>
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-sans text-xs font-medium text-muted-foreground">
                                <Lock size={12} weight="BoldDuotone" />
                                Upgrade
                              </span>
                            </span>
                          )
                        : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <UpsellModal
                open={upsellOpen}
                onOpenChange={setUpsellOpen}
                featureName="Translation Audio"
                description="Translation Audio exam is available on the Member plan. Upgrade to unlock it."
              />
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FormLabel className="tracking-wide dark:text-slate-400">
              Selected Words
            </FormLabel>
            <span className={cn('inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', selectedWords.length === 0 && 'opacity-50')}>
              {selectedWords.length}
              {' '}
              Selected
            </span>
          </div>
          {selectedWords.length === 0
            ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Archive weight="BoldDuotone" size={32} className="text-muted-foreground" />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No words selected yet.</p>
                    <p>Pick some from the list to start</p>
                    <p>training.</p>
                  </div>
                </div>
              )
            : (
                <div className="flex flex-wrap gap-2">
                  {selectedWords.slice(0, MAX_VISIBLE_SELECTED_WORDS).map(({ id, label }) => (
                    <span
                      key={id}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
                        !label && 'opacity-70',
                      )}
                    >
                      <span className="max-w-[220px] truncate">{label ?? '…'}</span>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-200/70 dark:text-blue-200 dark:hover:bg-blue-900/40"
                        onClick={() => removeSelectedWord(id)}
                        aria-label={label ? `Remove ${label}` : 'Remove selected word'}
                      >
                        <CloseCircle size={14} weight="BoldDuotone" />
                      </button>
                    </span>
                  ))}
                  {selectedWords.length > MAX_VISIBLE_SELECTED_WORDS && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      +
                      {selectedWords.length - MAX_VISIBLE_SELECTED_WORDS}
                      {' '}
                      more
                    </span>
                  )}
                </div>
              )}
        </div>

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

export default TrainerBasicInfoForm;
