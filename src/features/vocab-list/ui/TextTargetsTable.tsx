'use client';

import type { ColumnDef, VisibilityState } from '@tanstack/react-table';
import type { TTextTarget } from '@/types/vocab-list';
import { Pen } from '@solar-icons/react/ssr';
import React, { useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteTextTarget } from '@/actions/text-targets';
import { DeleteActionButton } from '@/shared/ui/shared';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/table';
import { SubjectBadgeGroup } from './SubjectBadgeGroup';

type TextTargetsTableProps = {
  textTargets: TTextTarget[];
  vocabId: string;
  onEdit: (item: TTextTarget) => void;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (vis: VisibilityState) => void;
};

function GrammarTags({ grammar }: { grammar: string }) {
  if (!grammar) {
    return null;
  }
  const parts = grammar.split(/[,\s]+/).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map(part => (
        <span
          key={part}
          className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          {part}
        </span>
      ))}
    </div>
  );
}

function ExamplesCell({ examples }: { examples: TTextTarget['vocabExamples'] }) {
  const first = examples[0];
  if (!first) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="min-w-0 border-l-2 border-primary pl-2">
        <p className="truncate text-xs font-medium text-foreground">{first.source}</p>
        <p className="truncate text-xs text-muted-foreground italic">{first.target}</p>
      </div>
      {examples.length > 1 && (
        <span className="shrink-0 text-muted-foreground">⋮</span>
      )}
    </div>
  );
}

const TextTargetsTable: React.FC<TextTargetsTableProps> = ({
  textTargets,
  vocabId,
  onEdit,
  totalItems,
  totalPages,
  currentPage,
  pageSize = 10,
  searchValue,
  onSearchChange,
  columnVisibility,
  onColumnVisibilityChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', String(size));
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const columns = useMemo<ColumnDef<TTextTarget>[]>(() => [
    {
      accessorKey: 'textTarget',
      header: 'Text Target',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.textTarget}</span>
      ),
      enableSorting: true,
      size: 180,
    },
    {
      id: 'wordType',
      header: 'Type',
      cell: ({ row }) => {
        const name = row.original.wordType?.name;
        if (!name) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <span className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {name}
          </span>
        );
      },
      enableSorting: false,
      size: 130,
    },
    {
      accessorKey: 'grammar',
      header: 'Grammar',
      cell: ({ row }) => <GrammarTags grammar={row.original.grammar} />,
      enableSorting: false,
      size: 140,
    },
    {
      accessorKey: 'explanationSource',
      header: 'Explanation (Source)',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.explanationSource || '—'}</span>
      ),
      enableSorting: false,
      size: 200,
    },
    {
      accessorKey: 'explanationTarget',
      header: 'Explanation (Target)',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground italic">{row.original.explanationTarget || '—'}</span>
      ),
      enableSorting: false,
      size: 200,
    },
    {
      id: 'subjects',
      header: 'Subjects',
      cell: ({ row }) => {
        const subjects = row.original.textTargetSubjects.map(ts => ({
          id: ts.subject.id,
          name: ts.subject.name,
        }));
        return <SubjectBadgeGroup subjects={subjects} />;
      },
      enableSorting: false,
      size: 160,
    },
    {
      id: 'examples',
      header: 'Examples',
      cell: ({ row }) => <ExamplesCell examples={row.original.vocabExamples} />,
      enableSorting: false,
      size: 220,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-accent"
            onClick={() => onEdit(row.original)}
          >
            <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
          </Button>
          <DeleteActionButton
            itemId={row.original.id}
            itemName="text target"
            onDelete={async (id: string) => {
              await deleteTextTarget(vocabId, id);
            }}
            onSuccess={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
            successMessage="Text target deleted successfully!"
            errorMessage="Failed to delete text target. Please try again."
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
    },
  ], [onEdit, vocabId, router, startTransition]);

  return (
    <DataTable
      columns={columns}
      data={textTargets}
      showSearch={true}
      searchPlaceholder="Search text targets..."
      searchValue={searchValue}
      onSearchChangeAction={onSearchChange}
      showPagination={true}
      enableColumnResizing={true}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      pageCount={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onSortingChange={handleSortingChange}
      onPageSizeChange={handlePageSizeChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
    />
  );
};

export default TextTargetsTable;
