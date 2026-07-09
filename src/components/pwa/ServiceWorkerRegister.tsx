'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // ponytail: dev-mode JS chunks aren't content-hashed like prod, so a cache-first
    // SW serves stale code forever across HMR reloads — only run the SW in production.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach(registration => registration.unregister());
      });
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ponytail: install failures are non-fatal, app works fine without offline shell
    });
  }, []);

  return null;
}
