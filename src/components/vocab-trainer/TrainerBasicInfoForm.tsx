'use client';

import { Archive, CloseCircle, Lock } from '@solar-icons/react/ssr';
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
import { UserRole } from '@/constants/auth';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { isFsrsQuestionType } from '@/libs/validations/vocab-trainer';
import type { TSrsDefaults } from '@/types/srs-settings';
import { UpsellModal } from '@/components/premium/UpsellModal';

type TrainerBasicInfoFormProps = Readonly<{
  userRole?: string;
  selectedWords?: Array<{ id: string; label?: string }>;
  /** The mode of an existing trainer cannot change. */
  editMode?: boolean;
  srsDefaults?: TSrsDefaults;
}>;

const MODE_OPTIONS = [
  { value: ETrainerMode.CLASSIC, title: 'Classic', hint: 'A timed test of the words you pick, every time.' },
  { value: ETrainerMode.FSRS, title: 'Spaced repetition', hint: 'Short daily reviews; each word returns just before you would forget it.' },
];

const FSRS_QUESTION_TYPE_OPTIONS = [
  { value: EQuestionType.FLIP_CARD, label: 'Flip card (rate yourself)' },
  { value: EQuestionType.FILL_IN_THE_BLANK, label: 'Type the answer' },
];

const MAX_VISIBLE_SELECTED_WORDS = 20;
const EMPTY_SELECTED_WORDS: TrainerBasicInfoFormProps['selectedWords'] = [];

const TrainerBasicInfoForm: React.FC<TrainerBasicInfoFormProps> = ({ userRole, selectedWords = EMPTY_SELECTED_WORDS, editMode = false, srsDefaults }) => {
  const form = useFormContext();
  const isFsrs = form.watch('mode') === ETrainerMode.FSRS;
  const [upsellOpen, setUpsellOpen] = useState(false);
  const isGuest = userRole === UserRole.GUEST;
  const reminderLabelId = React.useId();

  const removeSelectedWord = (id: string) => {
    const current = (form.getValues('vocabAssignmentIds') as string[]) || [];
    const next = current.filter(x => x !== id);
    form.setValue('vocabAssignmentIds', next, { shouldDirty: true, shouldValidate: true });
    if (next.length > 0) {
      form.clearErrors('vocabAssignmentIds');
    }
  };

  const changeMode = (mode: ETrainerMode) => {
    if (editMode || mode === form.getValues('mode')) {
      return;
    }
    form.setValue('mode', mode, { shouldDirty: true });
    if (mode === ETrainerMode.FSRS) {
      if (!isFsrsQuestionType(form.getValues('questionType') as EQuestionType)) {
        form.setValue('questionType', srsDefaults?.questionType ?? EQuestionType.FLIP_CARD, { shouldDirty: true });
      }
      if (srsDefaults) {
        form.setValue('reminderDisabled', !srsDefaults.reminderEnabled, { shouldDirty: true });
      }
    }
    form.clearErrors();
  };

  const questionTypeOptions = isFsrs ? FSRS_QUESTION_TYPE_OPTIONS : QUESTION_TYPE_OPTIONS;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Mode</FormLabel>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Learning mode">
                {MODE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === option.value}
                    disabled={editMode}
                    onClick={() => changeMode(option.value)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed',
                      field.value === option.value ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted',
                      editMode && field.value !== option.value && 'opacity-50',
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
              {editMode && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock size={12} weight="BoldDuotone" />
                  The mode is fixed after the trainer is created.
                </p>
              )}
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
                  {questionTypeOptions.map(option => (
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FormLabel className="tracking-wide">
              Selected Words
            </FormLabel>
            <span className={cn('inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary', selectedWords.length === 0 && 'opacity-50')}>
              {selectedWords.length}
              {' '}
              Selected
            </span>
          </div>
          {selectedWords.length === 0
            ? (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                  <Archive weight="BoldDuotone" size={16} className="shrink-0" />
                  <span>Pick words from the list to start training.</span>
                </div>
              )
            : (
                <div className="flex max-h-[104px] flex-wrap gap-2 overflow-y-auto pr-1">
                  {selectedWords.slice(0, MAX_VISIBLE_SELECTED_WORDS).map(({ id, label }) => (
                    <span
                      key={id}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary',
                        !label && 'opacity-70',
                      )}
                    >
                      <span className="max-w-[220px] truncate">{label ?? '…'}</span>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/15"
                        onClick={() => removeSelectedWord(id)}
                        aria-label={label ? `Remove ${label}` : 'Remove selected word'}
                      >
                        <CloseCircle size={14} weight="BoldDuotone" />
                      </button>
                    </span>
                  ))}
                  {selectedWords.length > MAX_VISIBLE_SELECTED_WORDS && (
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
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
                <div className="flex w-full items-center justify-between">
                  <FormLabel id={reminderLabelId}>Reminders</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      role="switch"
                      aria-labelledby={reminderLabelId}
                      aria-checked={reminderEnabled}
                      onClick={() => {
                        field.onChange(!field.value);
                        form.clearErrors('reminderDisabled');
                      }}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        reminderEnabled ? 'bg-primary' : 'bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform',
                          reminderEnabled ? 'translate-x-5' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </FormControl>
                </div>
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
