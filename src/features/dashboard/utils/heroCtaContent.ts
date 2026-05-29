import { differenceInDays } from 'date-fns';

export type THeroCtaPriority = 'critical' | 'warning' | 'onTrack';

export type THeroCtaBadge = {
  label: string;
  className: string;
};

export type THeroCtaTitle = {
  count: number | null;
  rest: string;
};

export type THeroCtaContent = {
  priority: THeroCtaPriority;
  badge: THeroCtaBadge;
  totalNeedReview: number;
  title: THeroCtaTitle;
  body: { kind: 'daysSince'; days: number } | { kind: 'noSessions' };
  showCta: boolean;
  ctaLabel: string;
};

type TBuildHeroCtaContentInput = {
  criticalCount: number;
  warningCount: number;
  lastPracticeAt: string | null;
};

function toPriority(criticalCount: number, warningCount: number): THeroCtaPriority {
  if (criticalCount > 0) {
    return 'critical';
  }
  if (warningCount > 0) {
    return 'warning';
  }
  return 'onTrack';
}

function buildBadge(priority: THeroCtaPriority): THeroCtaBadge {
  if (priority === 'critical') {
    return { label: 'HIGH PRIORITY', className: 'bg-destructive/15 text-destructive' };
  }
  if (priority === 'warning') {
    return { label: 'NEEDS ATTENTION', className: 'bg-warning/15 text-warning' };
  }
  return { label: 'ALL GOOD', className: 'bg-success/15 text-success' };
}

function pluralize(value: number, singular: string): string {
  return value === 1 ? singular : `${singular}s`;
}

export function formatDaysBody(days: number): string {
  const dayLabel = pluralize(days, 'day');
  return `It’s been ${days} ${dayLabel} since your last practice session.`;
}

function buildBody(lastPracticeAt: string | null): THeroCtaContent['body'] {
  if (!lastPracticeAt) {
    return { kind: 'noSessions' };
  }

  const last = new Date(lastPracticeAt);
  const days = Math.max(0, differenceInDays(new Date(), last));
  return { kind: 'daysSince', days };
}

export function buildHeroCtaContent(input: TBuildHeroCtaContentInput): THeroCtaContent {
  const totalNeedReview = input.criticalCount + input.warningCount;
  const priority = toPriority(input.criticalCount, input.warningCount);
  const badge = buildBadge(priority);
  const body = buildBody(input.lastPracticeAt);

  if (priority === 'onTrack') {
    return {
      priority,
      badge,
      totalNeedReview,
      title: { count: null, rest: 'You’re on track — nothing needs review.' },
      body,
      showCta: false,
      ctaLabel: '',
    };
  }

  const rest = priority === 'critical' ? ' need your urgent review' : ' need review';
  const ctaLabel = `Practice These ${totalNeedReview} Words →`;

  return {
    priority,
    badge,
    totalNeedReview,
    title: { count: totalNeedReview, rest },
    body,
    showCta: true,
    ctaLabel,
  };
}

