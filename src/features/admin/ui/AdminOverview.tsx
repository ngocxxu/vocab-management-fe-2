import type { TAdminStats } from '@/types/admin';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/shared/ui/card';
import SignupsChart from './SignupsChart';

type AdminOverviewProps = Readonly<{
  /** Missing when the load failed; the page then shows the load error. */
  stats?: TAdminStats;
}>;

type TTone = 'neutral' | 'warning' | 'destructive';

type TileProps = Readonly<{
  label: string;
  value: number;
  hint?: string;
  /** Adds an accent bar only when the number needs a look. Neutral tiles stay quiet. */
  tone?: TTone;
}>;

const TONE_ACCENT: Record<TTone, string> = {
  neutral: '',
  warning: 'border-l-4 border-l-warning',
  destructive: 'border-l-4 border-l-destructive',
};

function Tile({ label, value, hint, tone = 'neutral' }: TileProps) {
  return (
    <Card className={`border border-border bg-card shadow-none ${TONE_ACCENT[tone]}`}>
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-3xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </CardContent>
    </Card>
  );
}

export async function AdminOverview({ stats }: AdminOverviewProps) {
  const t = await getTranslations('admin.overview');

  if (!stats) {
    return <p className="text-destructive">{t('loadError')}</p>;
  }

  const signupSeries = stats.signupsDaily.map(day => ({ label: day.date.slice(5), count: day.count }));

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="admin-users-heading" className="flex flex-col gap-3">
        <h2 id="admin-users-heading" className="text-lg font-semibold text-foreground">{t('users')}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label={t('total')} value={stats.users.total} hint={t('byRole', { admin: stats.users.byRole.ADMIN, member: stats.users.byRole.MEMBER, guest: stats.users.byRole.GUEST })} />
          <Tile label={t('active')} value={stats.users.active} />
          <Tile label={t('deactivated')} value={stats.users.inactive} tone={stats.users.inactive > 0 ? 'warning' : 'neutral'} />
          <Tile label={t('newSevenDays')} value={stats.users.new7d} hint={t('newThirtyDays', { count: stats.users.new30d })} />
        </div>
      </section>

      <SignupsChart
        title={t('signupsTitle')}
        description={t('signupsDescription')}
        data={signupSeries}
        ariaLabel={t('signupsAria')}
        valueLabel={t('signupsValue')}
      />

      <section aria-labelledby="admin-content-heading" className="flex flex-col gap-3">
        <h2 id="admin-content-heading" className="text-lg font-semibold text-foreground">{t('content')}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label={t('vocabs')} value={stats.content.vocabs} />
          <Tile label={t('trainers')} value={stats.content.trainers} />
          <Tile label={t('examResults')} value={stats.content.examResults} />
          <Tile label={t('reviewsSevenDays')} value={stats.content.reviews7d} />
        </div>
      </section>

      <section aria-labelledby="admin-ops-heading" className="flex flex-col gap-3">
        <h2 id="admin-ops-heading" className="text-lg font-semibold text-foreground">{t('operations')}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label={t('jobFailures')} value={stats.ops.jobFailures24h} tone={stats.ops.jobFailures24h > 0 ? 'destructive' : 'neutral'} />
        </div>
      </section>
    </div>
  );
}
