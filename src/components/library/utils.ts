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
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length] || 'from-blue-500 to-blue-600';
  }

  // Fallback to random color if no seed provided
  return colors[Math.floor(Math.random() * colors.length)] || 'from-blue-500 to-blue-600';
};
