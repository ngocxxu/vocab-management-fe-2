'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

type TCopyFieldProps = Readonly<{
  label: string;
  value: string;
}>;

export function CopyField({ label, value }: TCopyFieldProps) {
  const t = useTranslations('connectAi');
  const { status, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center">
        <code
          className="min-w-0 flex-1 text-sm break-all text-foreground"
          style={{ fontFamily: 'var(--font-connect-mono), ui-monospace, monospace' }}
        >
          {value}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={() => copy(value)}>
          {status === 'copied' ? t('copy.copied') : t('copy.idle')}
        </Button>
      </div>
      {status === 'failed' && (
        <p role="alert" className="text-sm text-destructive">{t('copy.failed')}</p>
      )}
    </div>
  );
}
