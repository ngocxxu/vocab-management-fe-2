'use client';

import type { SubjectsPaginationProps } from '@/types/subject';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react/ssr';
import { Button } from '@/components/ui/button';

export function SubjectsPagination({ currentPage, totalItems, pageSize, onPageChange }: SubjectsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const showing = totalItems === 0 ? 0 : end - start + 1;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        Showing
        {' '}
        {showing}
        {' '}
        of
        {' '}
        {totalItems}
        {' '}
        subjects
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <AltArrowLeft size={16} weight="BoldDuotone" />
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 rounded-full p-0 text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <AltArrowRight size={16} weight="BoldDuotone" />
        </Button>
      </div>
    </div>
  );
}
