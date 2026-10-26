import { describe, expect, it } from 'vitest';
import { ENotificationReminderKind } from '@/types/notification';
import { getReminderTarget } from './utils';

describe('getReminderTarget', () => {
  it('sends an FSRS reminder to its review page, without needing a question type', () => {
    const target = getReminderTarget({ trainerId: 't1', kind: ENotificationReminderKind.FSRS_DUE });

    expect(target).toEqual({ trainerId: 't1', isFsrs: true });
  });

  it('sends a classic reminder to its exam, with the question type', () => {
    const target = getReminderTarget({ trainerId: 't1', questionType: 'FLIP_CARD', kind: ENotificationReminderKind.INITIAL });

    expect(target).toEqual({ trainerId: 't1', isFsrs: false, questionType: 'FLIP_CARD' });
  });

  it('has no target for a classic reminder without a question type, because the exam cannot be opened', () => {
    const target = getReminderTarget({ trainerId: 't1', kind: ENotificationReminderKind.ESCALATION });

    expect(target).toBeNull();
  });

  it('has no target when the trainer id is missing, for either kind', () => {
    expect(getReminderTarget({ kind: ENotificationReminderKind.FSRS_DUE })).toBeNull();
    expect(getReminderTarget({ questionType: 'FLIP_CARD', kind: ENotificationReminderKind.INITIAL })).toBeNull();
  });

  it('has no target when the notification has no data at all', () => {
    expect(getReminderTarget(undefined)).toBeNull();
  });
});
