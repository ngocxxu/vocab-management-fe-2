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

export const getLanguageName = (code: string): string => {
  const languageNames: Record<string, string> = {
    ko: 'Korean',
    en: 'English',
    vi: 'Vietnamese',
    ja: 'Japanese',
    zh: 'Chinese',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
  };
  return languageNames[code] || code.toUpperCase();
};

export const generateFolderColor = (seed?: string): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
  ];

  if (seed) {
    // Generate a stable color based on the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.codePointAt(i);
      hash = ((hash << 5) - hash) + (char || 0);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length] || 'from-blue-500 to-blue-600';
  }

  // Fallback to random color if no seed provided
  return colors[Math.floor(Math.random() * colors.length)] || 'from-blue-500 to-blue-600';
};
