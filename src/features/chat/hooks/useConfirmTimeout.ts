import { useEffect, useRef, useState } from 'react';

export function useConfirmTimeout(
  active: boolean,
  durationSeconds: number,
  onTimeout: () => void,
): number {
  const [remaining, setRemaining] = useState(durationSeconds);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!active) {
      setRemaining(durationSeconds);
      return;
    }

    setRemaining(durationSeconds);

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, durationSeconds]);

  return remaining;
}
