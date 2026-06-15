'use client';

import type { TCreateTextTarget, TTextTarget, TUpdateTextTarget } from '@/types/vocab-list';
import type { TSubjectResponse } from '@/types/subject';
import type { TWordTypeResponse } from '@/types/word-type';
import { MagicStick, RefreshCircle } from '@solar-icons/react/ssr';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generateTextTargetContent } from '@/actions/vocabs';
import { createTextTarget, updateTextTarget } from '@/actions/text-targets';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { MultiSelect } from '@/shared/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import ExamplesSection from './ExamplesSection';

type TextTargetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabId: string;
  textSource?: string;
  sourceLanguageCode?: string;
  targetLanguageCode?: string;
  editingItem?: TTextTarget | null;
  editMode?: boolean;
  initialSubjectsData?: TSubjectResponse;
  initialWordTypesData?: TWordTypeResponse;
  onSuccess: () => void;
};

type FormState = {
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  wordTypeId: string;
  subjectIds: string[];
  vocabExamples: Array<{ id: string; source: string; target: string }>;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const defaultForm = (): FormState => ({
  textTarget: '',
  grammar: '',
  explanationSource: '',
  explanationTarget: '',
  wordTypeId: '',
  subjectIds: [],
  vocabExamples: [{ id: generateId(), source: '', target: '' }],
});

const COOLDOWN_DURATION_MS = 60_000;
const GLOBAL_STORAGE_KEY = 'play_button_last_click_global';

const TextTargetDialog: React.FC<TextTargetDialogProps> = ({
  open,
  onOpenChange,
  vocabId,
  textSource,
  sourceLanguageCode,
  targetLanguageCode,
  editingItem,
  editMode = false,
  initialSubjectsData,
  initialWordTypesData,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const checkCooldown = useCallback(() => {
    try {
      const lastClickTimeStr = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (!lastClickTimeStr) {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }
      const lastClickTime = Number.parseInt(lastClickTimeStr, 10);
      if (Number.isNaN(lastClickTime)) {
        localStorage.removeItem(GLOBAL_STORAGE_KEY);
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }
      const remaining = Math.ceil((COOLDOWN_DURATION_MS - (Date.now() - lastClickTime)) / 1000);
      if (remaining > 0) {
        setIsCooldownActive(true);
        setCooldownRemaining(remaining);
      } else {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
      }
    } catch {
      setIsCooldownActive(false);
      setCooldownRemaining(0);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [open, checkCooldown]);

  const handleGenerateAI = async () => {
    if (!textSource || !sourceLanguageCode || !targetLanguageCode) {
      toast.error('Missing source text or language codes');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateTextTargetContent({ textSource, sourceLanguageCode, targetLanguageCode });
      setForm(prev => ({
        ...prev,
        textTarget: result.textTarget,
        wordTypeId: result.wordTypeId || prev.wordTypeId,
        explanationSource: result.explanationSource,
        explanationTarget: result.explanationTarget,
        vocabExamples: result.vocabExamples?.length
          ? result.vocabExamples.map(e => ({ id: generateId(), source: e.source, target: e.target }))
          : prev.vocabExamples,
      }));
      toast.success('AI generated content successfully');
      try {
        localStorage.setItem(GLOBAL_STORAGE_KEY, Date.now().toString());
        checkCooldown();
      } catch {}
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordTypes = initialWordTypesData?.items || [];
  const subjects = initialSubjectsData?.items || [];

  useEffect(() => {
    if (editMode && editingItem) {
      setForm({
        textTarget: editingItem.textTarget,
        grammar: editingItem.grammar,
        explanationSource: editingItem.explanationSource,
        explanationTarget: editingItem.explanationTarget,
        wordTypeId: editingItem.wordTypeId || '',
        subjectIds: editingItem.textTargetSubjects.map(ts => ts.subject.id),
        vocabExamples: editingItem.vocabExamples.length > 0
          ? editingItem.vocabExamples.map(e => ({ id: generateId(), source: e.source, target: e.target }))
          : [{ id: generateId(), source: '', target: '' }],
      });
    } else {
      setForm(defaultForm());
    }
  }, [editMode, editingItem, open]);

  const handleClose = () => {
    setForm(defaultForm());
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!form.textTarget.trim()) {
      toast.error('Text target is required');
      return;
    }
    if (form.subjectIds.length === 0) {
      toast.error('At least one subject must be selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: TCreateTextTarget = {
        textTarget: form.textTarget,
        grammar: form.grammar,
        explanationSource: form.explanationSource,
        explanationTarget: form.explanationTarget,
        wordTypeId: form.wordTypeId || undefined,
        subjectIds: form.subjectIds,
        vocabExamples: form.vocabExamples.map(({ source, target }) => ({ source, target })),
      };

      if (editMode && editingItem) {
        await updateTextTarget(vocabId, editingItem.id, payload as TUpdateTextTarget);
        toast.success('Text target updated successfully');
      } else {
        await createTextTarget(vocabId, payload);
        toast.success('Text target created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save text target';
      toast.error('Error', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddExample = () => {
    setForm(prev => ({
      ...prev,
      vocabExamples: [...prev.vocabExamples, { id: generateId(), source: '', target: '' }],
    }));
  };

  const handleRemoveExample = (index: number) => {
    setForm(prev => ({
      ...prev,
      vocabExamples: prev.vocabExamples.filter((_, i) => i !== index),
    }));
  };

  const handleExampleChange = (exampleIndex: number, field: 'source' | 'target', value: string) => {
    setForm(prev => ({
      ...prev,
      vocabExamples: prev.vocabExamples.map((ex, i) =>
        i === exampleIndex ? { ...ex, [field]: value } : ex,
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Text Target' : 'Add Text Target'}</DialogTitle>
          <DialogDescription>
            {editMode ? 'Update the details for this text target' : 'Enter the details for a new text target'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Core Meaning */}
          <section className="pl-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-2 shrink-0 rounded-full bg-primary" />
                <h4 className="text-sm font-semibold">Core Meaning</h4>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGenerating || isCooldownActive || !textSource || !sourceLanguageCode || !targetLanguageCode}
                className="h-7 gap-1.5 text-xs"
              >
                {isGenerating
                  ? (
                      <>
                        <RefreshCircle size={12} weight="BoldDuotone" className="animate-spin" />
                        Generating...
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
                          AI Generate
                        </>
                      )}
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="textTarget">Target Text</Label>
                <Input
                  id="textTarget"
                  placeholder="Enter target text..."
                  value={form.textTarget}
                  onChange={e => updateField('textTarget', e.target.value)}
                  className="mt-1 w-full"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="wordType">Word Type</Label>
                  <Select value={form.wordTypeId || ''} onValueChange={v => updateField('wordTypeId', v)}>
                    <SelectTrigger id="wordType" className="mt-1 w-full">
                      <SelectValue placeholder="Select word type" />
                    </SelectTrigger>
                    <SelectContent>
                      {wordTypes.map(wt => (
                        <SelectItem key={wt.id} value={wt.id}>{wt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grammar">Grammar Notes</Label>
                  <Input
                    id="grammar"
                    placeholder="e.g. Used with prepositions"
                    value={form.grammar}
                    onChange={e => updateField('grammar', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Subjects</Label>
                <MultiSelect
                  options={subjects.map(s => ({ value: s.id, label: s.name }))}
                  defaultValue={form.subjectIds}
                  onValueChange={v => updateField('subjectIds', v)}
                  placeholder="Choose subjects..."
                  maxCount={5}
                  className="w-full"
                  resetOnDefaultValueChange={true}
                />
              </div>
            </div>
          </section>

          {/* Explanations */}
          <section className="pl-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-5 w-2 shrink-0 rounded-full bg-primary" />
              <h4 className="text-sm font-semibold">Explanations</h4>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="explanationSource" className="text-xs tracking-wide uppercase">
                  Source
                </Label>
                <Textarea
                  id="explanationSource"
                  placeholder="Input source explanation..."
                  value={form.explanationSource}
                  onChange={e => updateField('explanationSource', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="explanationTarget" className="text-xs tracking-wide uppercase">
                  Target
                </Label>
                <Textarea
                  id="explanationTarget"
                  placeholder="Input target explanation..."
                  value={form.explanationTarget}
                  onChange={e => updateField('explanationTarget', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="pl-4">
            <ExamplesSection
              targetIndex={0}
              examples={form.vocabExamples}
              onExampleChange={(exIndex, field, value, _targetIndex) => handleExampleChange(exIndex, field, value)}
              onAddExample={_targetIndex => handleAddExample()}
              onRemoveExample={(exIndex, _targetIndex) => handleRemoveExample(exIndex)}
            />
          </section>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <RefreshCircle size={16} className="mr-2 animate-spin" />}
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextTargetDialog;
