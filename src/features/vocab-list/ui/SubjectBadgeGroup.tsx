'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/libs/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export type TSubjectBadge = {
  id: string;
  name: string;
};

type SubjectBadgeGroupProps = Readonly<{
  subjects: TSubjectBadge[];
}>;

const SUBJECT_BADGE_GAP = 8;

function SubjectBadge({ subject, className }: Readonly<{ subject: TSubjectBadge; className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md bg-warning/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-warning-foreground',
        className,
      )}
    >
      {subject.name}
    </span>
  );
}

export function SubjectBadgeGroup({ subjects }: SubjectBadgeGroupProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureBadgeRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const measureMoreRef = useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(subjects.length);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const visibleSubjects = subjects.slice(0, visibleCount);
  const hiddenSubjects = subjects.slice(visibleCount);
  const hiddenCount = hiddenSubjects.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const calculateVisibleCount = () => {
      const availableWidth = container.clientWidth;
      const badgeWidths = subjects.map((_, index) => measureBadgeRefs.current[index]?.offsetWidth ?? 0);
      const moreWidth = measureMoreRef.current?.offsetWidth ?? 0;

      if (!availableWidth || badgeWidths.includes(0)) {
        return;
      }

      let nextVisibleCount = subjects.length;

      for (let count = subjects.length; count >= 0; count -= 1) {
        const visibleWidths = badgeWidths.slice(0, count).reduce((total, width) => total + width, 0);
        const needsMoreBadge = count < subjects.length;
        const visibleGaps = Math.max(count - 1, 0) * SUBJECT_BADGE_GAP;
        const moreGap = needsMoreBadge && count > 0 ? SUBJECT_BADGE_GAP : 0;
        const totalWidth = visibleWidths + visibleGaps + (needsMoreBadge ? moreWidth + moreGap : 0);

        if (totalWidth <= availableWidth) {
          nextVisibleCount = count;
          break;
        }
      }

      setVisibleCount(nextVisibleCount);
    };

    calculateVisibleCount();

    const resizeObserver = new ResizeObserver(calculateVisibleCount);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [subjects]);

  if (subjects.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        {visibleSubjects.map(subject => <SubjectBadge key={subject.id} subject={subject} />)}

        {hiddenCount > 0 && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center rounded-full border border-dashed border-border bg-background px-3 py-0.5 text-xs font-semibold whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
                onFocus={() => setPopoverOpen(true)}
                onBlur={() => setPopoverOpen(false)}
                aria-label={`Show ${hiddenCount} more subjects`}
              >
                +
                {hiddenCount}
                {' '}
                more
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              className="w-auto max-w-64 p-2"
              onMouseEnter={() => setPopoverOpen(true)}
              onMouseLeave={() => setPopoverOpen(false)}
            >
              <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                {hiddenSubjects.map(subject => <SubjectBadge key={subject.id} subject={subject} className="w-fit" />)}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-2 whitespace-nowrap" aria-hidden="true">
        {subjects.map((subject, index) => (
          <span
            key={subject.id}
            ref={(element) => {
              measureBadgeRefs.current[index] = element;
            }}
            className="inline-flex shrink-0 items-center rounded-md bg-warning/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-warning-foreground"
          >
            {subject.name}
          </span>
        ))}
        <button
          ref={measureMoreRef}
          type="button"
          className="inline-flex shrink-0 items-center rounded-full border border-dashed border-border bg-background px-3 py-0.5 text-xs font-semibold whitespace-nowrap text-muted-foreground"
          tabIndex={-1}
        >
          +
          {subjects.length}
          {' '}
          more
        </button>
      </div>
    </div>
  );
}
