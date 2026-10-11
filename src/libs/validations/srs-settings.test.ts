import { describe, expect, it } from 'vitest';
import { formatRecallPerTen, isValidTimezone, srsSettingsFormSchema } from './srs-settings';

const valid = {
  desiredRetention: 0.9,
  directions: ['SOURCE_TO_TARGET', 'TARGET_TO_SOURCE'],
  questionType: 'FLIP_CARD',
  reminderEnabled: true,
  timezone: 'Asia/Ho_Chi_Minh',
};

describe('srsSettingsFormSchema', () => {
  it('accepts valid settings', () => {
    expect(srsSettingsFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each([0.7, 0.97])('accepts a retention of %s (the edges)', (desiredRetention) => {
    expect(srsSettingsFormSchema.safeParse({ ...valid, desiredRetention }).success).toBe(true);
  });

  it.each([0.69, 0.98, 1, 0])('rejects a retention of %s', (desiredRetention) => {
    expect(srsSettingsFormSchema.safeParse({ ...valid, desiredRetention }).success).toBe(false);
  });

  it('needs at least one direction', () => {
    const result = srsSettingsFormSchema.safeParse({ ...valid, directions: [] });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.directionRequired');
  });

  it('rejects a repeated direction and an unknown one', () => {
    expect(srsSettingsFormSchema.safeParse({ ...valid, directions: ['SOURCE_TO_TARGET', 'SOURCE_TO_TARGET'] }).success).toBe(false);
    expect(srsSettingsFormSchema.safeParse({ ...valid, directions: ['SIDEWAYS'] }).success).toBe(false);
  });

  it('rejects a question type FSRS cannot review', () => {
    expect(srsSettingsFormSchema.safeParse({ ...valid, questionType: 'MULTIPLE_CHOICE' }).success).toBe(false);
  });

  it('rejects a timezone that does not exist', () => {
    expect(srsSettingsFormSchema.safeParse({ ...valid, timezone: 'Mars/Olympus' }).success).toBe(false);
    expect(srsSettingsFormSchema.safeParse({ ...valid, timezone: '' }).success).toBe(false);
  });
});

describe('isValidTimezone', () => {
  it('accepts IANA names only', () => {
    expect(isValidTimezone('Europe/Paris')).toBe(true);
    expect(isValidTimezone('Mars/Olympus')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});

describe('formatRecallPerTen', () => {
  it.each([
    [0.9, '9'],
    [0.85, '8.5'],
    [0.7, '7'],
    [0.97, '9.7'],
  ])('shows a retention of %s as %s words out of 10', (retention, expected) => {
    expect(formatRecallPerTen(retention)).toBe(expected);
  });
});
