'use client';

import type {
  TWordRelationDraft,
  TWordRelationPendingFlags,
  WordRelationsSectionProps,
} from '@/types/vocab-list';
import React from 'react';
import { cn } from '@/libs/utils';
import { Button } from '@/shared/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { Input } from '@/shared/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';

const RELATION_FLAG_META: Record<keyof TWordRelationPendingFlags, {
  label: string;
  activeClassName: string;
  inactiveClassName: string;
}> = {
  isSynonym: {
    label: 'Synonym',
    activeClassName: 'border-success/40 bg-success/10 text-success hover:bg-success/15',
    inactiveClassName: 'border-border bg-background text-muted-foreground hover:bg-muted/50',
  },
  isAntonym: {
    label: 'Antonym',
    activeClassName: 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15',
    inactiveClassName: 'border-border bg-background text-muted-foreground hover:bg-muted/50',
  },
  isRelated: {
    label: 'Related',
    activeClassName: 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15',
    inactiveClassName: 'border-border bg-background text-muted-foreground hover:bg-muted/50',
  },
};

type RelationFlag = keyof TWordRelationPendingFlags;

function RelationFlagButton({
  active,
  disabled,
  flag,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  flag: RelationFlag;
  onClick: () => void;
}) {
  const meta = RELATION_FLAG_META[flag];

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn(
        'h-6 flex-1 rounded-xl border text-sm font-medium shadow-none transition-colors',
        active ? meta.activeClassName : meta.inactiveClassName,
      )}
      onClick={onClick}
      title={meta.label}
    >
      {meta.label}
    </Button>
  );
}

function RelationBadge({
  active,
  label,
  tone,
}: {
  active: boolean;
  label: string;
  tone: 'success' | 'destructive' | 'primary';
}) {
  const toneClassName = {
    success: active
      ? 'bg-success text-success-foreground'
      : 'bg-muted text-muted-foreground',
    destructive: active
      ? 'bg-destructive text-destructive-foreground'
      : 'bg-muted text-muted-foreground',
    primary: active
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-muted-foreground',
  }[tone];

  return (
    <span className={cn(
      'inline-flex h-4 min-w-4 items-center justify-center rounded-lg px-1 text-sm font-semibold',
      toneClassName,
    )}
    >
      {label}
    </span>
  );
}

function RelationEditor({
  relation,
  onUpdateRelationFlags,
}: {
  relation: TWordRelationDraft;
  onUpdateRelationFlags: (relationId: string, flag: RelationFlag) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Edit Relation
      </p>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left shadow-none',
            relation.isSynonym
              ? 'border-success/30 bg-success/10 text-success hover:bg-success/15'
              : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
          )}
          disabled={relation.isAntonym}
          onClick={() => onUpdateRelationFlags(relation.id, 'isSynonym')}
        >
          <div className="flex items-center gap-3">
            <RelationBadge active={relation.isSynonym} label="S" tone="success" />
            <span className="text-sm font-medium">Synonym</span>
          </div>
          <span className="text-base">{relation.isSynonym ? '✓' : ''}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left shadow-none',
            relation.isAntonym
              ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15'
              : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
          )}
          disabled={relation.isSynonym}
          onClick={() => onUpdateRelationFlags(relation.id, 'isAntonym')}
        >
          <div className="flex items-center gap-3">
            <RelationBadge active={relation.isAntonym} label="A" tone="destructive" />
            <span className="text-sm font-medium">Antonym</span>
          </div>
          <span className="text-base">{relation.isAntonym ? '✓' : ''}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left shadow-none',
            relation.isRelated
              ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
              : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
          )}
          onClick={() => onUpdateRelationFlags(relation.id, 'isRelated')}
        >
          <div className="flex items-center gap-3">
            <RelationBadge active={relation.isRelated} label="R" tone="primary" />
            <span className="text-sm font-medium">Related</span>
          </div>
          <span className="text-base">{relation.isRelated ? '✓' : ''}</span>
        </Button>
      </div>
    </div>
  );
}

export default function WordRelationsSection({
  relationDrafts,
  relationInputValue,
  relationPendingFlags,
  editingRelationId,
  relationAutocompleteItems,
  relationAutocompleteLoading,
  editMode: _editMode = false,
  onRelationInputChange,
  onRelationFlagToggle,
  onAddFreeTextRelation,
  onAddLinkedRelation,
  onOpenRelationEditor,
  onUpdateRelationFlags,
  onRemoveRelation,
  hasInvalidRelationDrafts: _hasInvalidRelationDrafts,
}: WordRelationsSectionProps) {
  const hasAutocomplete = relationInputValue.trim().length > 0;
  const hasSuggestions = relationAutocompleteItems.length > 0;
  const shouldOpenAutocomplete = hasAutocomplete && (relationAutocompleteLoading || hasSuggestions);
  const [activeAutocompleteId, setActiveAutocompleteId] = React.useState<string | null>(null);
  const selectedAutocompleteId = shouldOpenAutocomplete && activeAutocompleteId && relationAutocompleteItems.some(
    item => item.id === activeAutocompleteId,
  )
    ? activeAutocompleteId
    : (shouldOpenAutocomplete ? relationAutocompleteItems[0]?.id ?? null : null);

  const handleSelectLinkedRelation = (item: typeof relationAutocompleteItems[number]) => {
    onAddLinkedRelation(item);
    setActiveAutocompleteId(null);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (!shouldOpenAutocomplete || relationAutocompleteItems.length === 0) {
        return;
      }

      event.preventDefault();
      const currentIndex = relationAutocompleteItems.findIndex(item => item.id === selectedAutocompleteId);
      const nextIndex = currentIndex === -1
        ? 0
        : Math.min(currentIndex + 1, relationAutocompleteItems.length - 1);
      setActiveAutocompleteId(relationAutocompleteItems[nextIndex]?.id ?? null);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!shouldOpenAutocomplete || relationAutocompleteItems.length === 0) {
        return;
      }

      event.preventDefault();
      const currentIndex = relationAutocompleteItems.findIndex(item => item.id === selectedAutocompleteId);
      const nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
      setActiveAutocompleteId(relationAutocompleteItems[nextIndex]?.id ?? null);
      return;
    }

    if (event.key === 'Escape') {
      if (!shouldOpenAutocomplete) {
        return;
      }

      event.preventDefault();
      setActiveAutocompleteId(null);
      onRelationInputChange('');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      const activeItem = relationAutocompleteItems.find(item => item.id === selectedAutocompleteId);
      if (activeItem) {
        handleSelectLinkedRelation(activeItem);
        return;
      }

      onAddFreeTextRelation();
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">
        Word Relations
      </h4>

      <div className="rounded-2xl border border-border/70 bg-muted p-3 shadow-sm">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Set Relationship Type
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <RelationFlagButton
            active={relationPendingFlags.isSynonym}
            disabled={relationPendingFlags.isAntonym}
            flag="isSynonym"
            onClick={() => onRelationFlagToggle('isSynonym')}
          />
          <RelationFlagButton
            active={relationPendingFlags.isAntonym}
            disabled={relationPendingFlags.isSynonym}
            flag="isAntonym"
            onClick={() => onRelationFlagToggle('isAntonym')}
          />
          <RelationFlagButton
            active={relationPendingFlags.isRelated}
            flag="isRelated"
            onClick={() => onRelationFlagToggle('isRelated')}
          />
        </div>
      </div>

      <Popover open={shouldOpenAutocomplete}>
        <PopoverAnchor asChild>
          <div>
            <Input
              type="text"
              value={relationInputValue}
              onChange={event => onRelationInputChange(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Type or search word and press Enter to add"
              className="w-full"
              aria-expanded={shouldOpenAutocomplete}
              aria-autocomplete="list"
              aria-controls="word-relations-autocomplete"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-border/70 p-0 shadow-md"
        >
          <Command value={selectedAutocompleteId ?? undefined}>
            <CommandList id="word-relations-autocomplete">
              {relationAutocompleteLoading
                ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Searching vocabs...
                    </div>
                  )
                : (
                    <>
                      <CommandGroup>
                        {relationAutocompleteItems.map(item => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => handleSelectLinkedRelation(item)}
                            onMouseEnter={() => setActiveAutocompleteId(item.id)}
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                          >
                            <span className="text-base font-medium text-foreground">{item.sourceText}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        Tip: You can select both a relation (S/A) and Related (R) simultaneously.
      </p>

      {relationDrafts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {relationDrafts.map((relation) => {
            const isOpen = editingRelationId === relation.id;
            const hasNoFlags = !relation.isSynonym && !relation.isAntonym && !relation.isRelated;

            return (
              <div key={relation.id} className="w-full">
                <Popover
                  open={isOpen}
                  onOpenChange={(open) => {
                    onOpenRelationEditor(open ? relation.id : null);
                  }}
                >
                  <PopoverTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left shadow-sm transition-colors',
                        hasNoFlags
                          ? 'border-dashed border-destructive bg-destructive/5'
                          : isOpen
                            ? 'border-primary/40 bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border/70 bg-background hover:bg-muted/30',
                      )}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenRelationEditor(isOpen ? null : relation.id);
                        }
                      }}
                      title={relation.word}
                    >
                      <span className={cn(
                        'min-w-0 flex-1 truncate text-base font-medium leading-none',
                        isOpen ? 'text-primary' : 'text-foreground',
                      )}
                      >
                        {relation.word}
                      </span>
                      <div className="flex items-center gap-2">
                        <RelationBadge active={relation.isSynonym} label="S" tone="success" />
                        <RelationBadge active={relation.isAntonym} label="A" tone="destructive" />
                        <RelationBadge active={relation.isRelated} label="R" tone="primary" />
                      </div>
                      <button
                        type="button"
                        className="text-xl leading-none text-muted-foreground transition-colors hover:text-foreground"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveRelation(relation.id);
                        }}
                        aria-label={`Remove ${relation.word}`}
                      >
                        ×
                      </button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[20rem] rounded-2xl">
                    <RelationEditor
                      relation={relation}
                      onUpdateRelationFlags={onUpdateRelationFlags}
                    />
                  </PopoverContent>
                </Popover>
                {hasNoFlags && (
                  <p className="mt-1 text-xs text-destructive">
                    At least one relation required
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
