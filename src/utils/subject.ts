export const SUBJECT_COLORS = [
  'bg-primary/15 text-primary',
  'bg-success/15 text-success',
  'bg-warning/20 text-warning-foreground',
  'bg-accent text-accent-foreground',
  'bg-destructive/15 text-destructive',
  'bg-secondary text-secondary-foreground',
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
