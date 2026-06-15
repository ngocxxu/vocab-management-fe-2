'use client';

import type { TTextTarget, TUpdateTextTarget } from '@/types/vocab-list';
import { Pen, TrashBinMinimalistic } from '@solar-icons/react/ssr';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteTextTarget, updateTextTarget } from '@/actions/text-targets';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

type TextTargetBalloonProps = {
  vocabId: string;
  target: TTextTarget;
};

export function TextTargetBalloon({ vocabId, target }: TextTargetBalloonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<TUpdateTextTarget>({
    textTarget: target.textTarget,
    grammar: target.grammar,
    explanationSource: target.explanationSource,
    explanationTarget: target.explanationTarget,
  });

  function handleChange(field: keyof TUpdateTextTarget, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.textTarget?.trim()) {
      toast.error('Text target cannot be empty');
      return;
    }
    startTransition(async () => {
      try {
        await updateTextTarget(vocabId, target.id, form);
        toast.success('Text target updated');
        setOpen(false);
        router.refresh();
      } catch {
        toast.error('Failed to update text target');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTextTarget(vocabId, target.id);
        toast.success('Text target deleted');
        router.refresh();
      } catch {
        toast.error('Failed to delete text target');
      }
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full p-0"
            aria-label="Edit text target"
            title="Edit"
          >
            <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-3 p-4" align="end">
          <p className="text-sm font-semibold text-foreground">Edit Text Target</p>

          <div className="space-y-1">
            <Label htmlFor={`tt-text-${target.id}`} className="text-xs">Text</Label>
            <Input
              id={`tt-text-${target.id}`}
              value={form.textTarget ?? ''}
              onChange={e => handleChange('textTarget', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`tt-grammar-${target.id}`} className="text-xs">Grammar</Label>
            <Input
              id={`tt-grammar-${target.id}`}
              value={form.grammar ?? ''}
              onChange={e => handleChange('grammar', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`tt-src-${target.id}`} className="text-xs">Explanation (source)</Label>
            <Textarea
              id={`tt-src-${target.id}`}
              value={form.explanationSource ?? ''}
              onChange={e => handleChange('explanationSource', e.target.value)}
              className="min-h-16 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`tt-tgt-${target.id}`} className="text-xs">Explanation (target)</Label>
            <Textarea
              id={`tt-tgt-${target.id}`}
              value={form.explanationTarget ?? ''}
              onChange={e => handleChange('explanationTarget', e.target.value)}
              className="min-h-16 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full p-0"
            aria-label="Delete text target"
            title="Delete"
            disabled={isPending}
          >
            <TrashBinMinimalistic size={16} weight="BoldDuotone" className="text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete text target?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete "${target.textTarget}" and cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
