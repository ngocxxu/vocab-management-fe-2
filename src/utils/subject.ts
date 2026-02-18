export const SUBJECT_COLORS = [
  'bg-sky-200 text-sky-800 dark:bg-sky-600 dark:text-sky-100',
  'bg-emerald-200 text-emerald-800 dark:bg-emerald-600 dark:text-emerald-100',
  'bg-amber-200 text-amber-800 dark:bg-amber-600 dark:text-amber-100',
  'bg-violet-200 text-violet-800 dark:bg-violet-600 dark:text-violet-100',
  'bg-rose-200 text-rose-800 dark:bg-rose-600 dark:text-rose-100',
  'bg-cyan-200 text-cyan-800 dark:bg-cyan-600 dark:text-cyan-100',
];

export function getSubjectInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts[1]?.charAt(0) ?? '';
    const combined = (a + b).toUpperCase().slice(0, 2) ?? '';
    return combined || '??';
  }
  const raw = name.trim().slice(0, 2).toUpperCase();
  return `${raw ?? '??'}`;
}

export function getSubjectColor(index: number): string {
  const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  return color ?? SUBJECT_COLORS[0] ?? '';
}

export function formatCreatedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
