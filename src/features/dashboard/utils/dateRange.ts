import { format, subDays } from 'date-fns';

export function getProgressDateRange(dayCount: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = subDays(end, dayCount - 1);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

export function getCalendarYearDateRange(year: number = new Date().getFullYear()): {
  startDate: string;
  endDate: string;
  year: number;
} {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    year,
  };
}
