import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/libs/Logger';

export type TCopyStatus = 'idle' | 'copied' | 'failed';

const STATUS_RESET_MS = 2000;

export function useCopyToClipboard() {
  const [status, setStatus] = useState<TCopyStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch (error) {
      // Clipboard API is missing in insecure contexts and can be denied; show the fallback message.
      logger.warn('Clipboard copy failed:', { error });
      setStatus('failed');
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), STATUS_RESET_MS);
  }, []);

  return { status, copy };
}
