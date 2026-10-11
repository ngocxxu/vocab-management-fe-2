import { differenceInDays } from 'date-fns';

export type THeroCtaPriority = 'critical' | 'warning' | 'onTrack';

export type THeroCtaBadge = {
  labelKey: string;
  className: string;
};

export type THeroCtaTitle = {
  count: number | null;
  messageKey: 'urgent' | 'review' | 'onTrack';
};

export type THeroCtaContent = {
  priority: THeroCtaPriority;
  badge: THeroCtaBadge;
  totalNeedReview: number;
  title: THeroCtaTitle;
  body: { kind: 'daysSince'; days: number } | { kind: 'noSessions' };
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
    return { labelKey: 'badge.critical', className: 'bg-destructive/15 text-destructive' };
  }
  if (priority === 'warning') {
    return { labelKey: 'badge.warning', className: 'bg-warning/15 text-warning' };
  }
  return { labelKey: 'badge.onTrack', className: 'bg-success/15 text-success' };
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
      title: { count: null, messageKey: 'onTrack' },
      body,
    };
  }

  return {
    priority,
    badge,
    totalNeedReview,
    title: { count: totalNeedReview, messageKey: priority === 'critical' ? 'urgent' : 'review' },
    body,
  };
}
