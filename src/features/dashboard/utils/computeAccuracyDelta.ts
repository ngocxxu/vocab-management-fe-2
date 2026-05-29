import type { TProgressOverTime } from '@/types/statistics';
import { subDays } from 'date-fns';

function accuracyFromProgressSlice(items: TProgressOverTime[]): number | null {
  if (items.length === 0) {
    return null;
  }
  const sum = items.reduce((acc, p) => acc + p.averageMastery, 0);
  return sum / items.length;
}

export function computeAccuracyDelta(
  progress: TProgressOverTime[],
  totalCorrect: number,
  totalIncorrect: number,
): number | null {
  const total = totalCorrect + totalIncorrect;
  if (total === 0 || progress.length < 2) {
    return null;
  }

  const now = new Date();
  const weekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);

  const currentWeek = progress.filter((p) => {
    const d = new Date(p.date);
    return d >= weekAgo && d <= now;
  });

  const previousWeek = progress.filter((p) => {
    const d = new Date(p.date);
    return d >= twoWeeksAgo && d < weekAgo;
  });

  if (currentWeek.length === 0 || previousWeek.length === 0) {
    return null;
  }

  const prevMastery = accuracyFromProgressSlice(previousWeek);
  const currMastery = accuracyFromProgressSlice(currentWeek);

  if (prevMastery === null || currMastery === null) {
    return null;
  }

  const prevProxyAccuracy = Math.round((prevMastery / 10) * 100);
  const currProxyAccuracy = Math.round((currMastery / 10) * 100);
  const delta = currProxyAccuracy - prevProxyAccuracy;

  if (delta === 0) {
    return null;
  }

  return delta;
}
