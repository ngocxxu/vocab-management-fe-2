import { Card, CardContent } from '@/components/ui/card';
import { buildHeroCtaContent } from '../utils/heroCtaContent';
import { Button } from '@/shared/ui/button';
import { Danger } from '@solar-icons/react/ssr';
import Link from 'next/link';

type THeroCTAProps = {
  criticalCount: number;
  warningCount: number;
  lastPracticeAt: string | null;
};

export function HeroCTA({ criticalCount, warningCount, lastPracticeAt }: THeroCTAProps) {
  const content = buildHeroCtaContent({ criticalCount, warningCount, lastPracticeAt });
  const iconBgClass = content.priority === 'critical'
    ? 'bg-destructive/15'
    : content.priority === 'warning'
      ? 'bg-warning/15'
      : 'bg-success/15';

  const iconFgClass = content.priority === 'critical'
    ? 'text-destructive'
    : content.priority === 'warning'
      ? 'text-warning'
      : 'text-success';

  return (
    <Card
      className={[
        'flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card py-0 shadow-sm',
        'bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)]',
        'bg-[size:28px_28px]',
      ].join(' ')}
    >
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className={`rounded-2xl p-3 ${iconBgClass}`}>
            <Danger aria-hidden="true" size={22} weight="BoldDuotone" className={iconFgClass} />
          </div>
          <span
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
              content.badge.className,
            ].join(' ')}
          >
            {content.badge.label}
          </span>
        </div>

        <h2 className="mt-5 text-2xl leading-tight font-extrabold text-pretty text-foreground sm:text-3xl">
          {content.title.count !== null
            ? (
                <>
                  <span className="text-destructive">{`${content.title.count} words`}</span>
                  <span>{content.title.rest}</span>
                </>
              )
            : content.title.rest}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {content.body.kind === 'noSessions'
            ? 'No practice sessions yet. Start your first session today.'
            : (
                <>
                  {`It’s been `}
                  <strong className="font-semibold text-foreground">{`${content.body.days} day${content.body.days === 1 ? '' : 's'}`}</strong>
                  {` since your last practice session.`}
                </>
              )}
        </p>

        {content.showCta && (
          <Button asChild className="mt-auto h-12 w-full rounded-2xl text-base font-semibold">
            <Link href="/vocab-trainer?preset=problematic">{content.ctaLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
