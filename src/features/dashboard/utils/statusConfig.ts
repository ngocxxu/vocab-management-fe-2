export type TErrorRateStatus = 'CRITICAL' | 'WARNING' | 'NORMAL';

export const errorRateStatusConfig: Record<
  TErrorRateStatus,
  { label: string; className: string }
> = {
  CRITICAL: { label: 'CRITICAL', className: 'bg-destructive/15 text-destructive' },
  WARNING: { label: 'WARNING', className: 'bg-warning/15 text-warning' },
  NORMAL: { label: 'NORMAL', className: 'bg-muted text-muted-foreground' },
};

export function getErrorRateStatus(errorRatePct: number): TErrorRateStatus {
  if (errorRatePct >= 60) {
    return 'CRITICAL';
  }
  if (errorRatePct >= 40) {
    return 'WARNING';
  }
  return 'NORMAL';
}

export function getErrorRateTextClass(errorRatePct: number): string {
  if (errorRatePct >= 60) {
    return 'text-destructive';
  }
  if (errorRatePct >= 40) {
    return 'text-warning';
  }
  return 'text-muted-foreground';
}
