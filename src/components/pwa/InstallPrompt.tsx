'use client';

import { CloseCircle } from '@solar-icons/react/ssr';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';

const DISMISS_KEY = 'pwa-install-prompt-dismissed';

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) || !isIosSafari()) {
      return;
    }
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
      <p className="flex-1 text-sm text-foreground">
        Install this app: tap
        {' '}
        <span aria-hidden="true">⬆️</span>
        {' '}
        Share, then "Add to Home Screen".
      </p>
      <Button size="icon" variant="ghost" onClick={dismiss} aria-label="Dismiss install prompt">
        <CloseCircle className="size-4" />
      </Button>
    </div>
  );
}
