'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TVocab } from '@/types/vocab-list';
import { Eye, Pen, VolumeLoud } from '@solar-icons/react/ssr';
import React from 'react';
import { DeleteActionButton } from '@/shared/ui/shared';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/table';
import ExpandedRowContent from './ExpandedRowContent';

type VocabFeedViewProps = {
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
  onLinkedWordClick: (word: string) => void;
  onAddFreeTextWord: (word: string) => void;
};

// Single placeholder column — renderBody below ignores `cell`, only used for colSpan bookkeeping.
const FEED_COLUMNS: ColumnDef<TVocab>[] = [{ id: 'feed', header: '' }];

const VocabFeedView: React.FC<VocabFeedViewProps> = ({
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
  onLinkedWordClick,
  onAddFreeTextWord,
}) => {
  return (
    <DataTable
      columns={FEED_COLUMNS}
      data={vocabs}
      searchPlaceholder="Search vocab..."
      searchValue={searchValue}
      onSearchChangeAction={onSearchChangeAction}
      showSearch={true}
      showPagination={true}
      hideHeader={true}
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
        vocabs.length === 0
          ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-muted-foreground" colSpan={1}>
                  No results
                </td>
              </tr>
            )
          : vocabs.map(vocab => (
              <ExpandedRowContent
                key={vocab.id}
                vocab={vocab}
                columnsCount={1}
                onEdit={onEdit}
                onLinkedWordClick={onLinkedWordClick}
                onAddFreeTextWord={onAddFreeTextWord}
                headerContent={(
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="max-w-64 min-w-0 truncate text-xl font-bold text-foreground" title={vocab.textSource}>
                        {vocab.textSource}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 p-0"
                        onClick={() => onSpeak(vocab)}
                        aria-label="Play pronunciation"
                      >
                        <VolumeLoud size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent" onClick={() => onView(vocab)}>
                        <Eye size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent" onClick={() => onEdit(vocab)}>
                        <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                      <DeleteActionButton
                        itemId={vocab.id}
                        itemName="vocabulary item"
                        onDelete={onDeleteVocab}
                        onSuccess={onDeleteSuccess}
                        successMessage="Vocabulary deleted successfully!"
                        errorMessage="Failed to delete vocabulary. Please try again."
                      />
                    </div>
                  </div>
                )}
              />
            ))
      )}
    />
  );
};

export default VocabFeedView;
