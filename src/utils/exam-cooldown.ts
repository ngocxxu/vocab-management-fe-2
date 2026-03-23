export const EXAM_COOLDOWN_DURATION_MS = 60000;
export const EXAM_COOLDOWN_STORAGE_KEY = 'play_button_last_click_global';

export const getExamCooldownRemainingSeconds = (): number => {
  try {
    const lastClickTimeStr = localStorage.getItem(EXAM_COOLDOWN_STORAGE_KEY);
    if (!lastClickTimeStr) {
      return 0;
    }

    const lastClickTime = Number.parseInt(lastClickTimeStr, 10);
    if (Number.isNaN(lastClickTime)) {
      localStorage.removeItem(EXAM_COOLDOWN_STORAGE_KEY);
      return 0;
    }

    const elapsed = Date.now() - lastClickTime;
    return Math.max(0, Math.ceil((EXAM_COOLDOWN_DURATION_MS - elapsed) / 1000));
  } catch {
    return 0;
  }
};

export const markExamCooldownNow = (): void => {
  try {
    localStorage.setItem(EXAM_COOLDOWN_STORAGE_KEY, Date.now().toString());
  } catch {
  }
};
