export function formatEditedAgo(updatedAt?: string | null): string {
  if (updatedAt == null || updatedAt === '') {
    return '—';
  }
  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString();
}

export { getLanguageName } from '@/shared/utils/language';

export const generateFolderColor = (seed?: string): string => {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-success',
    'bg-warning',
    'bg-destructive',
  ];

  if (seed) {
    // Generate a stable color based on the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.codePointAt(i);
      hash = ((hash << 5) - hash) + (char || 0);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length] || 'bg-primary';
  }

  // Fallback to random color if no seed provided
  return colors[Math.floor(Math.random() * colors.length)] || 'bg-primary';
};
