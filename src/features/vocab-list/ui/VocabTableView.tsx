'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TExamples, TFlatVocabRow, TVocab } from '@/types/vocab-list';
import type { TRelatedWordItem } from '@/types/vocab-related-word';
import { Eye, Pen, VolumeLoud } from '@solar-icons/react/ssr';
import React, { useMemo } from 'react';
import { DeleteActionButton } from '@/shared/ui/shared';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/table';
import { flattenVocabTextTargets } from '../utils/flattenVocabTextTargets';
import { groupRelatedWordsByType } from '../utils/groupRelatedWordsByType';

type VocabTableViewProps = {
  vocabs: TVocab[];
  searchValue: string;
  onSearchChangeAction: (value: string) => void;
  pageSize: number;
  isLoading: boolean;
  pageCount: number;
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onSortingChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageSizeChange: (pageSize: number) => void;
  onSpeak: (vocab: TVocab) => void;
  onEdit: (vocab: TVocab, textTargetIndex?: number) => void;
  onDeleteVocab: (id: string) => Promise<void>;
  onDeleteSuccess: () => void;
  onView: (vocab: TVocab) => void;
};

function RelatedWordsGroup({ label, words }: { label: string; words: TRelatedWordItem[] }) {
  if (words.length === 0) {
    return null;
  }
  return (
    <div className="mt-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {words.map(w => (
          <span
            key={w.id}
            className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {w.word}
          </span>
        ))}
      </div>
    </div>
  );
}

// Cell rendering is fully controlled by `renderBody` below — these defs only supply
// headers + sortability for the header row. `textSource` stays sortable (matches the
// Collapse view's sort field); the rest have no single-value accessor, so sorting is disabled.
const TABLE_COLUMNS: ColumnDef<TFlatVocabRow>[] = [
  { id: 'textSource', accessorFn: row => row.vocab.textSource, header: 'Text Source', enableSorting: true },
  { id: 'textTarget', header: 'Text Target', enableSorting: false },
  { id: 'context', header: 'Context & Nuance', enableSorting: false },
  { id: 'examples', header: 'Examples', enableSorting: false },
  { id: 'actions', header: '', enableSorting: false },
];

const VocabTableView: React.FC<VocabTableViewProps> = ({
  vocabs,
  searchValue,
  onSearchChangeAction,
  pageSize,
  isLoading,
  pageCount,
  currentPage,
  totalItems,
  onPageChange,
  onSortingChange,
  onPageSizeChange,
  onSpeak,
  onEdit,
  onDeleteVocab,
  onDeleteSuccess,
  onView,
}) => {
  const flatRows = useMemo(() => flattenVocabTextTargets(vocabs), [vocabs]);

  return (
    <DataTable
      columns={TABLE_COLUMNS}
      data={flatRows}
      displayCount={vocabs.length}
      searchPlaceholder="Search vocab..."
      searchValue={searchValue}
      onSearchChangeAction={onSearchChangeAction}
      showSearch={true}
      showPagination={true}
      pageSize={pageSize}
      isLoading={isLoading}
      skeletonRowCount={pageSize}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      pageCount={pageCount}
      currentPage={currentPage}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onSortingChange={onSortingChange}
      onPageSizeChange={onPageSizeChange}
      renderBody={() => (
        flatRows.length === 0
          ? (
              <tr className="border-b border-border">
                <td className="px-3 py-4 text-xs text-muted-foreground sm:px-6 sm:py-6 sm:text-sm" colSpan={TABLE_COLUMNS.length}>
                  No results
                </td>
              </tr>
            )
          : flatRows.map((row) => {
              const relations = groupRelatedWordsByType(row.vocab.relatedWords);
              const examples = row.textTarget?.vocabExamples?.filter((ex: TExamples) => ex.source || ex.target) ?? [];

              return (
                <tr key={row.id} className="border-b border-border transition-colors duration-200 hover:bg-muted/30">
                  {row.isGroupStart && (
                    <>
                      <td rowSpan={row.groupSize} className="border-r border-border px-3 py-3 align-top sm:px-6 sm:py-4">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-foreground">{row.vocab.textSource}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 p-0 hover:bg-accent"
                            onClick={() => onSpeak(row.vocab)}
                            aria-label="Play pronunciation"
                          >
                            <VolumeLoud size={16} weight="BoldDuotone" className="text-muted-foreground" />
                          </Button>
                        </div>
                        <RelatedWordsGroup label="Synonyms" words={relations.synonyms} />
                        <RelatedWordsGroup label="Related" words={relations.related} />
                        <RelatedWordsGroup label="Antonyms" words={relations.antonyms} />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <span className="text-sm text-foreground">{row.textTarget?.textTarget ?? '—'}</span>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    {row.textTarget?.explanationSource && <p className="text-sm text-foreground italic">{row.textTarget.explanationSource}</p>}
                    {row.textTarget?.explanationTarget && <p className="mt-1 text-xs text-muted-foreground">{row.textTarget.explanationTarget}</p>}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    {examples.length === 0
                      ? <span className="text-xs text-muted-foreground">—</span>
                      : (
                          <div className="space-y-1.5">
                            {examples.map((example: TExamples, idx: number) => (
                              <div key={`${row.id}-${idx}`} className="border-l-2 border-primary pl-2">
                                {example.source && <p className="text-sm text-foreground">{example.source}</p>}
                                {example.target && <p className="text-xs text-muted-foreground">{example.target}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent" onClick={() => onView(row.vocab)}>
                        <Eye size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent" onClick={() => onEdit(row.vocab, row.textTargetIndex)}>
                        <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                      {row.isGroupStart && (
                        <DeleteActionButton
                          itemId={row.vocab.id}
                          itemName="vocabulary item"
                          onDelete={onDeleteVocab}
                          onSuccess={onDeleteSuccess}
                          successMessage="Vocabulary deleted successfully!"
                          errorMessage="Failed to delete vocabulary. Please try again."
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
      )}
    />
  );
};

export default VocabTableView;
