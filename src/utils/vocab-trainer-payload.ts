import { ETrainerMode } from '@/enum/vocab-trainer';
import type { TTrainerFormData } from '@/libs/validations/vocab-trainer';
import type { TCreateVocabTrainer, TUpdateVocabTrainer } from '@/types/vocab-trainer';

/** The form fields a trainer save reads. The FSRS settings are saved through their own endpoint. */
type TTrainerPayloadSource = Pick<
  TTrainerFormData,
  'name' | 'mode' | 'questionType' | 'setCountTime' | 'reminderDisabled' | 'vocabAssignmentIds' | 'reminderSpacingDays' | 'reminderMaxRepeat'
>;

/**
 * Fields every save sends. Status, Passes and the last-remind time are not here: the backend ignores them on update,
 * and only an exam changes them.
 */
function sharedFields(source: TTrainerPayloadSource) {
  return {
    name: source.name,
    questionType: source.questionType,
    reminderTime: 0,
    countTime: 0,
    setCountTime: source.setCountTime,
    reminderDisabled: source.reminderDisabled,
    vocabAssignmentIds: source.vocabAssignmentIds,
  };
}

/** Days between reminders (X) and max passes (T) are Classic only. The backend refuses them on an FSRS trainer. */
function classicReminderFields(source: TTrainerPayloadSource) {
  if (source.mode !== ETrainerMode.CLASSIC) {
    return {};
  }

  return { reminderSpacingDays: source.reminderSpacingDays, reminderMaxRepeat: source.reminderMaxRepeat };
}

export function buildUpdateVocabTrainerPayload(source: TTrainerPayloadSource): TUpdateVocabTrainer {
  return { ...sharedFields(source), ...classicReminderFields(source) };
}

/** Create still sends the first status, zero Passes and the last-remind time, which the backend reads on create. */
export function buildCreateVocabTrainerPayload(source: TTrainerPayloadSource, now: Date = new Date()): TCreateVocabTrainer {
  return {
    ...sharedFields(source),
    status: 'PENDING',
    reminderRepeat: 0,
    reminderLastRemind: now.toISOString(),
    ...classicReminderFields(source),
  };
}
