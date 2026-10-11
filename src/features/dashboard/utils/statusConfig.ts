export type TErrorRateStatus = 'CRITICAL' | 'WARNING' | 'NORMAL';

export const errorRateStatusConfig: Record<
  TErrorRateStatus,
  { labelKey: string; className: string }
> = {
  CRITICAL: { labelKey: 'status.critical', className: 'bg-destructive/15 text-destructive' },
  WARNING: { labelKey: 'status.warning', className: 'bg-warning/15 text-warning' },
  NORMAL: { labelKey: 'status.normal', className: 'bg-muted text-muted-foreground' },
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
