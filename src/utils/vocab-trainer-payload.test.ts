import { describe, expect, it } from 'vitest';
import { EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import { buildCreateVocabTrainerPayload, buildUpdateVocabTrainerPayload } from './vocab-trainer-payload';

const NOW = new Date('2026-10-04T10:00:00.000Z');

const classicForm = {
  name: 'Verbs',
  mode: ETrainerMode.CLASSIC,
  questionType: EQuestionType.MULTIPLE_CHOICE,
  setCountTime: 900,
  reminderDisabled: true,
  vocabAssignmentIds: ['v1', 'v2'],
  reminderSpacingDays: 5,
  reminderMaxRepeat: 8,
};

const fsrsForm = { ...classicForm, mode: ETrainerMode.FSRS, questionType: EQuestionType.FLIP_CARD };

describe('buildUpdateVocabTrainerPayload', () => {
  it('does not send status, Passes or the last-remind time', () => {
    const payload = buildUpdateVocabTrainerPayload(classicForm);

    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('reminderRepeat');
    expect(payload).not.toHaveProperty('reminderLastRemind');
  });

  it('keeps the reminder toggle, which the backend routes through its toggle path', () => {
    expect(buildUpdateVocabTrainerPayload(classicForm)).toMatchObject({
      name: 'Verbs',
      questionType: EQuestionType.MULTIPLE_CHOICE,
      setCountTime: 900,
      reminderDisabled: true,
      vocabAssignmentIds: ['v1', 'v2'],
    });
  });

  it('sends spacing (X) and max passes (T) for a classic trainer', () => {
    expect(buildUpdateVocabTrainerPayload(classicForm)).toMatchObject({ reminderSpacingDays: 5, reminderMaxRepeat: 8 });
  });

  it('does not send spacing or max passes for an FSRS trainer, which the backend refuses', () => {
    const payload = buildUpdateVocabTrainerPayload(fsrsForm);

    expect(payload).not.toHaveProperty('reminderSpacingDays');
    expect(payload).not.toHaveProperty('reminderMaxRepeat');
  });
});

describe('buildCreateVocabTrainerPayload', () => {
  it('keeps the create fields the backend reads on create', () => {
    expect(buildCreateVocabTrainerPayload(classicForm, NOW)).toMatchObject({
      status: 'PENDING',
      reminderRepeat: 0,
      reminderLastRemind: NOW.toISOString(),
      reminderDisabled: true,
      reminderSpacingDays: 5,
      reminderMaxRepeat: 8,
    });
  });

  it('does not send spacing or max passes for an FSRS trainer', () => {
    const payload = buildCreateVocabTrainerPayload(fsrsForm, NOW);

    expect(payload).not.toHaveProperty('reminderSpacingDays');
    expect(payload).not.toHaveProperty('reminderMaxRepeat');
  });
});
