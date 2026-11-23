import { describe, expect, it } from 'vitest';
import { ENotificationExamKind, ENotificationReminderKind } from '@/types/notification';
import { formatNotificationMessage, getExamBellResultUrl, getReminderTarget } from './utils';

const translate = (key: string, values?: Record<string, string | number>) => `${key}|${values?.name ?? ''}`;

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

describe('getExamBellResultUrl', () => {
  it('opens the saved fill-in-blank result for a graded or a failed bell', () => {
    expect(getExamBellResultUrl({ kind: ENotificationExamKind.GRADED, trainerId: 't1', examType: 'fill-in-blank' }))
      .toBe('/vocab-trainer/t1/exam/fill-in-blank/result');
    expect(getExamBellResultUrl({ kind: ENotificationExamKind.GRADING_FAILED, trainerId: 't1', examType: 'fill-in-blank' }))
      .toBe('/vocab-trainer/t1/exam/fill-in-blank/result');
  });

  it('opens the saved translation-audio result', () => {
    expect(getExamBellResultUrl({ kind: ENotificationExamKind.GRADED, trainerId: 't1', examType: 'translation-audio' }))
      .toBe('/vocab-trainer/t1/exam/translation-audio/result');
  });

  it('has no target for another bell kind, a missing trainer id, or an exam type without a saved result', () => {
    expect(getExamBellResultUrl({ kind: ENotificationReminderKind.INITIAL, trainerId: 't1', examType: 'fill-in-blank' })).toBeNull();
    expect(getExamBellResultUrl({ kind: ENotificationExamKind.GRADED, examType: 'fill-in-blank' })).toBeNull();
    expect(getExamBellResultUrl({ kind: ENotificationExamKind.GRADED, trainerId: 't1', examType: 'flip-card' })).toBeNull();
    expect(getExamBellResultUrl(undefined)).toBeNull();
  });
});

describe('formatNotificationMessage for exam bells', () => {
  it('says the result is ready for a graded bell, with the trainer name', () => {
    const notification = { type: 'VOCAB_TRAINER', action: 'CREATE', data: { kind: ENotificationExamKind.GRADED, trainerName: 'Animals' } };

    expect(formatNotificationMessage(notification as never, translate)).toBe('message.examGraded|Animals');
  });

  it('says grading failed for a failed bell, with the trainer name', () => {
    const notification = { type: 'VOCAB_TRAINER', action: 'CREATE', data: { kind: ENotificationExamKind.GRADING_FAILED, trainerName: 'Animals' } };

    expect(formatNotificationMessage(notification as never, translate)).toBe('message.examGradingFailed|Animals');
  });

  it('keeps the completion copy for a trainer bell without an exam kind', () => {
    const notification = { type: 'VOCAB_TRAINER', action: 'CREATE', data: { trainerName: 'Animals' } };

    expect(formatNotificationMessage(notification as never, translate)).toBe('message.trainerComplete|Animals');
  });
});
