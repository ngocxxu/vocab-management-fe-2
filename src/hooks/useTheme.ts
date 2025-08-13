'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const mounted = useRef(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    mounted.current = true;
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme: currentTheme,
    systemTheme,
    mounted: mounted.current,
    toggleTheme,
    setTheme,
  };
}
