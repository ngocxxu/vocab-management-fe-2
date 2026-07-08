'use client';

import type { SubjectsSectionProps } from '@/types/vocab-list';
import type { TSubjectGenerateResult } from '@/types/subject';
import { MagicStick, RefreshCircle } from '@solar-icons/react/ssr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { generateSubjectSuggestions } from '@/actions/subjects';
import { useTextTargetCooldown } from '../hooks/useTextTargetCooldown';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { MultiSelect } from '@/shared/ui/multi-select';
import { Skeleton } from '@/shared/ui/skeleton';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/utils/socket-config';

type SuggestState = 'idle' | 'suggesting' | 'done';

type PendingNewOption = { tempId: string; name: string };

const genTempId = () => `pending-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const SubjectsSection: React.FC<SubjectsSectionProps> = React.memo(({
  targetId,
  targetIndex,
  subjectIds,
  subjects,
  subjectsLoading,
  subjectsError,
  targetLanguageCode,
  textTarget,
}) => {
  const form = useFormContext();
  const [isMounted, setIsMounted] = useState(false);
  const [suggestState, setSuggestState] = useState<SuggestState>('idle');
  const [aiSuggestions, setAiSuggestions] = useState<TSubjectGenerateResult['result'] | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [pendingNewOptions, setPendingNewOptions] = useState<PendingNewOption[]>([]);
  const { socket, isConnected } = useSocket();
  const { isCooldownActive, cooldownRemaining, markUsed } = useTextTargetCooldown();

  const subjectIdsPath = `textTargets.${targetIndex}.subjectIds` as const;
  const pendingPath = `textTargets.${targetIndex}.pendingSubjectNames` as const;

  const currentSubjectIds: string[] = form.watch(subjectIdsPath) ?? subjectIds ?? [];
  const currentPendingNames: string[] = form.watch(pendingPath) ?? [];

  const activePendingTempIds = useMemo(
    () => pendingNewOptions.filter(p => currentPendingNames.includes(p.name)).map(p => p.tempId),
    [pendingNewOptions, currentPendingNames],
  );

  const multiSelectValue = useMemo(
    () => [...currentSubjectIds, ...activePendingTempIds],
    [currentSubjectIds, activePendingTempIds],
  );

  const pendingTempIdSet = useMemo(
    () => new Set(pendingNewOptions.map(p => p.tempId)),
    [pendingNewOptions],
  );

  const allOptions = useMemo(() => [
    ...subjects.map(s => ({ value: s.id, label: s.name })),
    ...pendingNewOptions.map(p => ({ value: p.tempId, label: p.name })),
  ], [subjects, pendingNewOptions]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!aiSuggestions) {
      setPendingNewOptions([]);
    }
  }, [aiSuggestions]);

  useEffect(() => {
    if (!socket || !isConnected || !currentJobId) {
      return;
    }
    const handler = (data: TSubjectGenerateResult) => {
      if (String(data.jobId) !== String(currentJobId)) {
        return;
      }
      setAiSuggestions(data.result);
      setSuggestState('done');
    };
    socket.on(SOCKET_EVENTS.SUBJECT_GENERATE_RESULT, handler);
    return () => {
      socket.off(SOCKET_EVENTS.SUBJECT_GENERATE_RESULT, handler);
    };
  }, [socket, isConnected, currentJobId]);

  const handleSuggest = useCallback(async () => {
    if (!textTarget?.trim() || !targetLanguageCode) {
      return;
    }
    setSuggestState('suggesting');
    setAiSuggestions(null);
    try {
      const { jobId } = await generateSubjectSuggestions({ textTarget, targetLanguageCode });
      setCurrentJobId(String(jobId));
      markUsed();
    } catch {
      setSuggestState('idle');
    }
  }, [textTarget, targetLanguageCode, markUsed]);

  const handleMultiSelectChange = useCallback((newValues: string[]) => {
    const newRealIds = newValues.filter(v => !pendingTempIdSet.has(v));
    const newTempIds = new Set(newValues.filter(v => pendingTempIdSet.has(v)));

    form.setValue(subjectIdsPath, newRealIds, { shouldDirty: true });
    form.clearErrors(subjectIdsPath);
    if (newRealIds.length > 0) {
      void form.trigger(subjectIdsPath);
    }

    const newPendingNames = pendingNewOptions
      .filter(p => newTempIds.has(p.tempId))
      .map(p => p.name);
    form.setValue(pendingPath, newPendingNames, { shouldDirty: true });
  }, [form, subjectIdsPath, pendingPath, pendingTempIdSet, pendingNewOptions]);

  const toggleExistingSubject = useCallback((id: string) => {
    const current = form.getValues(subjectIdsPath) as string[];
    if (current.includes(id)) {
      form.setValue(subjectIdsPath, current.filter(sid => sid !== id), { shouldDirty: true, shouldValidate: true });
    } else {
      form.setValue(subjectIdsPath, [...current, id], { shouldDirty: true, shouldValidate: true });
      form.clearErrors(subjectIdsPath);
    }
  }, [form, subjectIdsPath]);

  const toggleNewIdea = useCallback((name: string) => {
    const pending = (form.getValues(pendingPath) as string[]) ?? [];
    if (pending.includes(name)) {
      form.setValue(pendingPath, pending.filter(n => n !== name), { shouldDirty: true });
    } else {
      setPendingNewOptions((prev) => {
        if (prev.find(p => p.name === name)) {
          return prev;
        }
        return [...prev, { tempId: genTempId(), name }];
      });
      form.setValue(pendingPath, [...pending, name], { shouldDirty: true });
      form.clearErrors(subjectIdsPath);
    }
  }, [form, pendingPath, subjectIdsPath]);

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
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subjects</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={suggestState === 'suggesting' || isCooldownActive || !textTarget?.trim()}
          className="h-7 gap-1.5 text-xs"
        >
          {suggestState === 'suggesting'
            ? (
                <>
                  <RefreshCircle size={12} weight="BoldDuotone" className="animate-spin" />
                  Suggesting...
                </>
              )
            : isCooldownActive
              ? (
                  <>
                    <RefreshCircle size={12} weight="BoldDuotone" />
                    Wait
                    {' '}
                    {cooldownRemaining}
                    s
                  </>
                )
              : (
                  <>
                    <MagicStick size={12} weight="BoldDuotone" />
                    Suggest
                  </>
                )}
        </Button>
      </div>

      <FormField
        key={targetId}
        control={form.control}
        name={subjectIdsPath}
        render={() => (
          <FormItem>
            <FormLabel className="sr-only">Subjects</FormLabel>
            <FormControl>
              <MultiSelect
                key={targetId}
                options={allOptions}
                defaultValue={multiSelectValue}
                onValueChange={handleMultiSelectChange}
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

      {aiSuggestions && (
        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">AI SUGGESTED</span>
            <Badge variant="secondary">
              {aiSuggestions.totalCount}
              {' '}
              suggestions found
            </Badge>
          </div>

          {aiSuggestions.matchingExisting.length > 0 && (
            <div>
              <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">Matching Existing</p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.matchingExisting.map((s) => {
                  const isAdded = currentSubjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleExistingSubject(s.id)}
                      className={
                        isAdded
                          ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-colors'
                          : 'rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                      }
                    >
                      {isAdded ? `${s.name} ✓` : `${s.name} +`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {aiSuggestions.newCreativeIdeas.length > 0 && (
            <div>
              <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">New Creative Ideas</p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.newCreativeIdeas.map((s) => {
                  const isAdded = currentPendingNames.includes(s.name);
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => toggleNewIdea(s.name)}
                      className={
                        isAdded
                          ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-colors'
                          : 'rounded-full border border-dashed border-border px-3 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                      }
                    >
                      {isAdded ? `${s.name} ✓` : `${s.name} ✦`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SubjectsSection.displayName = 'SubjectsSection';

export default SubjectsSection;
