import { Danger } from '@solar-icons/react/ssr';

type TZoneErrorProps = {
  sectionName: string;
};

export function ZoneError({ sectionName }: TZoneErrorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
      <Danger size={18} weight="BoldDuotone" className="shrink-0 text-warning" />
      <span>
        Could not load
        {' '}
        {sectionName}
        . Try refreshing the page.
      </span>
    </div>
  );
}
