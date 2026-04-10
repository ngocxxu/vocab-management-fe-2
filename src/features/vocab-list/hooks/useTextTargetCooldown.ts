import { useCallback, useEffect, useState } from 'react';
import { TEXT_TARGET_COOLDOWN_DURATION_MS, TEXT_TARGET_GLOBAL_STORAGE_KEY } from '../constants/textTarget';

export function useTextTargetCooldown() {
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const checkCooldown = useCallback(() => {
    try {
      const lastClickTimeStr = localStorage.getItem(TEXT_TARGET_GLOBAL_STORAGE_KEY);
      if (!lastClickTimeStr) {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }

      const lastClickTime = Number.parseInt(lastClickTimeStr, 10);
      if (Number.isNaN(lastClickTime)) {
        localStorage.removeItem(TEXT_TARGET_GLOBAL_STORAGE_KEY);
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastClickTime;

      if (elapsed >= TEXT_TARGET_COOLDOWN_DURATION_MS) {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        localStorage.removeItem(TEXT_TARGET_GLOBAL_STORAGE_KEY);
      } else {
        setIsCooldownActive(true);
        setCooldownRemaining(Math.ceil((TEXT_TARGET_COOLDOWN_DURATION_MS - elapsed) / 1000));
      }
    } catch {
      setIsCooldownActive(false);
      setCooldownRemaining(0);
    }
  }, []);

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [checkCooldown]);

  const markUsed = useCallback(() => {
    try {
      localStorage.setItem(TEXT_TARGET_GLOBAL_STORAGE_KEY, Date.now().toString());
    } finally {
      checkCooldown();
    }
  }, [checkCooldown]);

  return { isCooldownActive, cooldownRemaining, markUsed };
}
