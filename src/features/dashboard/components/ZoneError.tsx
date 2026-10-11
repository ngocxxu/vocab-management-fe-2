import { Danger } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';

type TZoneErrorProps = {
  section: 'nextAction' | 'charts' | 'activity' | 'problematic';
};

export function ZoneError({ section }: TZoneErrorProps) {
  const t = useTranslations('dashboard.zoneError');

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
      <Danger size={18} weight="BoldDuotone" className="shrink-0 text-warning" />
      <span>
        {t('message', { section: t(`sections.${section}`) })}
      </span>
    </div>
  );
}
