import { describe, expect, it } from 'vitest';
import { EFsrsDirection, EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import {
  countCards,
  createCloneFormSchema,
  createTrainerFormSchema,
  dateInputToEndsAt,
  endsAtToDateInput,
  suggestNewPerDay,
} from './vocab-trainer';

const NOW = new Date(2026, 9, 4, 10, 0, 0);

const fsrsForm = {
  name: 'Exam words',
  mode: ETrainerMode.FSRS,
  questionType: EQuestionType.FLIP_CARD,
  setCountTime: 900,
  reminderDisabled: false,
  vocabAssignmentIds: ['v1'],
  fsrsDirections: [EFsrsDirection.SOURCE_TO_TARGET, EFsrsDirection.TARGET_TO_SOURCE],
  fsrsDesiredRetention: 0.9,
  fsrsMaximumInterval: 36500,
  fsrsNewPerDay: null,
  fsrsEndsAt: '',
};

function messages(form: object, options = {}) {
  const result = createTrainerFormSchema({ now: NOW, ...options }).safeParse(form);

  return result.success ? [] : result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
}

describe('createTrainerFormSchema', () => {
  it('accepts a valid FSRS trainer', () => {
    expect(messages(fsrsForm)).toEqual([]);
  });

  it('ignores the FSRS fields of a Classic trainer', () => {
    const classic = { ...fsrsForm, mode: ETrainerMode.CLASSIC, questionType: EQuestionType.MULTIPLE_CHOICE, fsrsDirections: [], fsrsDesiredRetention: 5 };

    expect(messages(classic)).toEqual([]);
  });

  it('rejects out-of-range values with a message per field', () => {
    const form = { ...fsrsForm, fsrsDesiredRetention: 0.99, fsrsMaximumInterval: 0, fsrsNewPerDay: 0, fsrsDirections: [] };

    expect(messages(form).map(m => m.split(':')[0]).sort()).toEqual(['fsrsDesiredRetention', 'fsrsDirections', 'fsrsMaximumInterval', 'fsrsNewPerDay']);
  });

  it('rejects a Classic-only question type for FSRS', () => {
    expect(messages({ ...fsrsForm, questionType: EQuestionType.MULTIPLE_CHOICE })).toEqual(['questionType: Pick flip card or type the answer']);
  });

  it('rejects a deadline in the past but allows today', () => {
    expect(messages({ ...fsrsForm, fsrsEndsAt: '2026-10-03' })).toEqual(['fsrsEndsAt: The deadline cannot be in the past']);
    expect(messages({ ...fsrsForm, fsrsEndsAt: '2026-10-04' })).toEqual([]);
  });

  it('keeps an unchanged deadline valid after it has passed, so the rest of an ended trainer can still be edited', () => {
    expect(messages({ ...fsrsForm, fsrsEndsAt: '2026-09-01' }, { originalEndsAt: '2026-09-01' })).toEqual([]);
  });

  it('rejects a date that does not exist', () => {
    expect(messages({ ...fsrsForm, fsrsEndsAt: '2026-02-31' })).toEqual(['fsrsEndsAt: Pick a valid date']);
  });
});

describe('suggestNewPerDay', () => {
  it('spreads the cards over the days left', () => {
    expect(suggestNewPerDay(24, '2026-10-10', NOW)).toBe(4);
    expect(suggestNewPerDay(25, '2026-10-10', NOW)).toBe(5);
  });

  it('puts everything on one day when the deadline is today', () => {
    expect(suggestNewPerDay(24, '2026-10-04', NOW)).toBe(24);
  });

  it('gives nothing without cards or a valid deadline', () => {
    expect(suggestNewPerDay(0, '2026-10-10', NOW)).toBeNull();
    expect(suggestNewPerDay(24, '', NOW)).toBeNull();
  });
});

describe('countCards', () => {
  it('is words times directions', () => {
    expect(countCards(12, 2)).toBe(24);
    expect(countCards(12, 0)).toBe(0);
  });
});

describe('deadline conversion', () => {
  it('round-trips a date through the end of that local day', () => {
    const endsAt = dateInputToEndsAt('2026-10-10');

    expect(endsAt).not.toBeNull();
    expect(endsAtToDateInput(endsAt)).toBe('2026-10-10');
    expect(new Date(endsAt!).getHours()).toBe(23);
  });

  it('maps no deadline both ways', () => {
    expect(dateInputToEndsAt('')).toBeNull();
    expect(endsAtToDateInput(null)).toBe('');
  });
});

describe('createCloneFormSchema', () => {
  const messagesOf = (form: object) => {
    const result = createCloneFormSchema({ now: NOW }).safeParse(form);

    return result.success ? [] : result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
  };

  it('accepts a name with or without a deadline', () => {
    expect([messagesOf({ name: 'Round 2', endsAt: '' }), messagesOf({ name: 'Round 2', endsAt: '2026-12-01' })]).toEqual([[], []]);
  });

  it('needs a name and keeps it short', () => {
    expect(messagesOf({ name: '   ', endsAt: '' })).toEqual(['name: Name is required']);
    expect(messagesOf({ name: 'x'.repeat(201), endsAt: '' })).toEqual(['name: Use at most 200 characters']);
  });

  it('refuses a deadline in the past but allows today', () => {
    expect(messagesOf({ name: 'Round 2', endsAt: '2026-10-03' })).toEqual(['endsAt: The deadline cannot be in the past']);
    expect(messagesOf({ name: 'Round 2', endsAt: '2026-10-04' })).toEqual([]);
  });

  it('refuses a date that does not exist', () => {
    expect(messagesOf({ name: 'Round 2', endsAt: '2026-02-31' })).toEqual(['endsAt: Pick a valid date']);
  });
});
